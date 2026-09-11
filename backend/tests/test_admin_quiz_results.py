"""Tests for the new admin quiz-results log endpoint."""
import os
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx
import jwt
import pytest
from dotenv import dotenv_values
from pymongo import MongoClient

PREVIEW_URL = "https://police-brq-ksa.preview.emergentagent.com"
BACKEND_ENV = dotenv_values(Path("/app/backend/.env"))
JWT_SECRET = BACKEND_ENV["JWT_SECRET"]
MONGO_URL = BACKEND_ENV["MONGO_URL"]
DB_NAME = BACKEND_ENV["DB_NAME"]
TEST_UID = "TESTUSER-QA"


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    # cleanup any leftover from prior aborted runs
    c[DB_NAME].quiz_results.delete_many({"user_id": TEST_UID})
    c.close()


@pytest.fixture(scope="module")
def admin_client():
    c = httpx.Client(base_url=f"{PREVIEW_URL}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": "admin@brq.sa", "password": "brq2026"})
    assert r.status_code == 200, r.text
    yield c
    c.close()


def forge_discord_cookie(uid: str, username: str) -> str:
    return jwt.encode(
        {"type": "discord", "uid": uid, "username": username,
         "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        JWT_SECRET, algorithm="HS256")


class TestAuthGuard:
    def test_unauthenticated_returns_401(self):
        with httpx.Client(base_url=f"{PREVIEW_URL}/api", timeout=30.0) as c:
            r = c.get("/admin/quiz-results")
            assert r.status_code == 401


class TestListQuizResults:
    def test_list_default_returns_expected_shape(self, admin_client):
        r = admin_client.get("/admin/quiz-results")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        # Expected required keys per contract
        required = {"id", "user_id", "username", "score", "total", "passed",
                    "role_granted", "created_at"}
        for item in data:
            assert required.issubset(item.keys())
            assert isinstance(item["passed"], bool)
            assert isinstance(item["role_granted"], bool)
        # Sorted desc by created_at
        dates = [item["created_at"] for item in data]
        assert dates == sorted(dates, reverse=True), "Results are not sorted by created_at desc"

    def test_abu_da7m_real_record_present(self, admin_client):
        r = admin_client.get("/admin/quiz-results?passed=true")
        assert r.status_code == 200
        data = r.json()
        # All items should be passed=true
        assert all(item["passed"] is True for item in data)
        abu = [item for item in data if item.get("username") == "Abu Da7m"]
        assert abu, "Real record for 'Abu Da7m' not found in passed results"
        rec = abu[0]
        assert rec["score"] == 15
        assert rec["total"] == 15
        assert rec["role_granted"] is True

    def test_passed_false_filter_only_failures(self, admin_client):
        r = admin_client.get("/admin/quiz-results?passed=false")
        assert r.status_code == 200
        for item in r.json():
            assert item["passed"] is False


class TestQuizSubmitCreatesRecord:
    def test_submit_with_wrong_answers_creates_failed_record(self, admin_client, mongo):
        # Forge a discord_session cookie for a QA test uid
        cookie = forge_discord_cookie(TEST_UID, "QA Tester")
        with httpx.Client(base_url=f"{PREVIEW_URL}/api", timeout=30.0,
                          cookies={"discord_session": cookie}) as c:
            answers = [{"id": i, "option": "x"} for i in range(1, 16)]
            r = c.post("/quiz/submit", json={"answers": answers})
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["score"] == 0
            assert data["total"] == 15
            assert data["passed"] is False
            assert data["role_granted"] is False

        # Now verify admin listing includes the QA Tester record
        r2 = admin_client.get("/admin/quiz-results?passed=false")
        assert r2.status_code == 200
        matches = [x for x in r2.json()
                   if x.get("user_id") == TEST_UID and x.get("username") == "QA Tester"]
        assert matches, "QA Tester failed submission not found in admin listing"
        rec = matches[0]
        assert rec["score"] == 0
        assert rec["total"] == 15
        assert rec["passed"] is False
        assert rec["role_granted"] is False

        # Cleanup
        result = mongo.quiz_results.delete_many({"user_id": TEST_UID})
        assert result.deleted_count >= 1
