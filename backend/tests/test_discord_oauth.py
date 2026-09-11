"""Tests for Discord OAuth login/callback/me/logout endpoints and quiz auth guard."""
import os
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse, parse_qs

import jwt
import httpx
import pytest
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

JWT_SECRET = os.environ["JWT_SECRET"]
DISCORD_CLIENT_ID = os.environ["DISCORD_CLIENT_ID"]
DISCORD_REDIRECT_URI = os.environ["DISCORD_REDIRECT_URI"]


def _forge_discord_cookie(uid="1547804619965472788", username="BRQ Bot", hours=1) -> str:
    return jwt.encode(
        {"type": "discord", "uid": uid, "username": username,
         "exp": datetime.now(timezone.utc) + timedelta(hours=hours)},
        JWT_SECRET, algorithm="HS256")


class TestDiscordLoginRedirect:
    def test_login_redirects_to_discord_oauth(self, client):
        # Do NOT follow redirects; do NOT navigate to discord.com
        r = client.get("/discord/login", follow_redirects=False)
        assert r.status_code in (302, 307), f"expected redirect got {r.status_code}"
        loc = r.headers.get("location", "")
        assert loc.startswith("https://discord.com/oauth2/authorize"), loc
        qs = parse_qs(urlparse(loc).query)
        assert qs.get("client_id") == [DISCORD_CLIENT_ID]
        assert qs.get("redirect_uri") == [DISCORD_REDIRECT_URI]
        assert qs.get("response_type") == ["code"]
        assert qs.get("scope") == ["identify guilds.join"]
        assert "state" in qs and len(qs["state"][0]) > 10
        # state must be a valid JWT of type oauth_state
        payload = jwt.decode(qs["state"][0], JWT_SECRET, algorithms=["HS256"])
        assert payload.get("type") == "oauth_state"


class TestDiscordAuthGuards:
    def test_discord_me_without_cookie_returns_401(self, client):
        r = client.get("/discord/me")
        assert r.status_code == 401
        data = r.json()
        assert "detail" in data

    def test_quiz_submit_without_cookie_returns_401_arabic(self, client):
        r = client.post("/quiz/submit", json={"answers": []})
        assert r.status_code == 401
        detail = r.json().get("detail", "")
        # Should contain Arabic text referencing discord login
        assert "الديسكورد" in detail, f"expected Arabic discord message, got: {detail}"

    def test_discord_me_with_forged_cookie_returns_user(self, client):
        cookie = _forge_discord_cookie(uid="123", username="TestUser")
        r = client.get("/discord/me", cookies={"discord_session": cookie})
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "123"
        assert data["username"] == "TestUser"

    def test_discord_me_invalid_cookie_returns_401(self, client):
        r = client.get("/discord/me", cookies={"discord_session": "not-a-jwt"})
        assert r.status_code == 401


class TestDiscordCallback:
    def test_callback_bad_state_redirects_to_fail(self, client):
        r = client.get("/discord/callback", params={"code": "x", "state": "bad"},
                       follow_redirects=False)
        assert r.status_code in (302, 307)
        loc = r.headers.get("location", "")
        assert loc == "/exam?discord=fail&reason=state", loc

    def test_callback_missing_code_redirects_to_fail(self, client):
        good_state = jwt.encode(
            {"type": "oauth_state", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
            JWT_SECRET, algorithm="HS256")
        r = client.get("/discord/callback", params={"code": "", "state": good_state},
                       follow_redirects=False)
        assert r.status_code in (302, 307)
        assert r.headers.get("location", "") == "/exam?discord=fail&reason=denied"


class TestDiscordLogout:
    def test_logout_clears_cookie(self, client):
        cookie = _forge_discord_cookie()
        # First confirm session works
        r1 = client.get("/discord/me", cookies={"discord_session": cookie})
        assert r1.status_code == 200
        # Logout
        r2 = client.post("/discord/logout", cookies={"discord_session": cookie})
        assert r2.status_code == 200
        assert r2.json().get("ok") is True
        # Cookie deletion header present
        set_cookie = r2.headers.get("set-cookie", "")
        assert "discord_session" in set_cookie


class TestQuizSubmitWithSession:
    def test_quiz_submit_with_wrong_answers_returns_fail(self, client):
        # Use a fake uid to avoid granting role; wrong answers so passed=False anyway
        cookie = _forge_discord_cookie(uid="000000000000000000", username="TEST_FailUser")
        # Get questions (order/options shuffled)
        qs = client.get("/quiz/questions").json()
        # Deliberately pick the FIRST option every time (may or may not be correct, but odds
        # of >=8 correct on 15 binary questions are low; use option[0] to keep deterministic).
        # To guarantee failure, use a nonsense string that won't match either option
        answers = [{"id": q["id"], "option": "__WRONG__"} for q in qs]
        r = client.post("/quiz/submit", json={"answers": answers},
                        cookies={"discord_session": cookie})
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 15
        assert data["passed"] is False
        assert data["role_granted"] is False
        assert data["score"] == 0

    def test_quiz_submit_incomplete_answers_returns_422(self, client):
        cookie = _forge_discord_cookie(uid="000", username="TEST")
        r = client.post("/quiz/submit", json={"answers": [{"id": 1, "option": "x"}]},
                        cookies={"discord_session": cookie})
        assert r.status_code == 422
