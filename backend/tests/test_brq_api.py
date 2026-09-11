"""Backend API tests for BRQ Saudi Police Mod app."""
import os
import httpx
import pytest

PREVIEW_URL = "https://police-brq-ksa.preview.emergentagent.com"


@pytest.fixture(scope="module")
def preview_client():
    with httpx.Client(base_url=f"{PREVIEW_URL}/api", timeout=30.0) as c:
        yield c


# --- Quiz Questions ---
class TestQuizQuestions:
    def test_returns_15_questions_with_expected_shape(self, preview_client):
        r = preview_client.get("/quiz/questions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 15
        ids = sorted(q["id"] for q in data)
        assert ids == list(range(1, 16))
        for q in data:
            assert set(q.keys()) == {"id", "question", "options"}
            assert "category" not in q
            assert isinstance(q["options"], list) and len(q["options"]) >= 2

    def test_shuffle_between_calls(self, preview_client):
        # Try up to 5 pairs — shuffle should very likely differ at least once
        differed = False
        prev = None
        for _ in range(5):
            r = preview_client.get("/quiz/questions")
            assert r.status_code == 200
            data = r.json()
            snapshot = [(q["id"], tuple(q["options"])) for q in data]
            if prev is not None and snapshot != prev:
                differed = True
                break
            prev = snapshot
        assert differed, "Quiz questions/options did not shuffle across calls"


# --- Quiz Submit ---
# Known correct answer TEXTS from server.py QUIZ_QUESTIONS
CORRECT_ANSWERS = {
    1: "تقمص الشخصية بالقول والعمل",
    2: "غير مسموح إلا بإذن من ضابط",
    3: "غير مسموح إلا بإذن من ضابط",
    4: "يُمنع العودة نهائياً",
    5: "خلف مركبة المخالف",
    6: "غير صحيح، الاصطفاف من رتبة ملازم فما فوق",
    7: "يُمنع الصدم نهائياً",
    8: "غير صحيح، يجب ترك 5 ثوانٍ بين كل بلاغ وبلاغ",
    9: "غير صحيح، فقط في الحالات الجنائية",
    10: "الصدم العشوائي",
    11: "القتل العشوائي أو القتل بدون سبب",
    12: "في السيناريوهات فقط",
    13: "في الحالات الجنائية فقط",
    14: "غير صحيح، إلا في حال بادر المواطن بإطلاق النار",
    15: "لا، يُمنع التفتيش بدون سبب أمني أو بلاغ جنائي",
}


class TestQuizSubmit:
    def test_all_correct_passes(self, preview_client):
        answers = [{"id": i, "option": CORRECT_ANSWERS[i]} for i in range(1, 16)]
        r = preview_client.post("/quiz/submit", json={"answers": answers})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["score"] == 15
        assert data["total"] == 15
        assert data["passed"] is True
        assert isinstance(data["token"], str) and len(data["token"]) > 0

    def test_exactly_8_correct_passes(self, preview_client):
        answers = []
        for i in range(1, 16):
            if i <= 8:
                answers.append({"id": i, "option": CORRECT_ANSWERS[i]})
            else:
                answers.append({"id": i, "option": "WRONG_ANSWER_TEXT"})
        r = preview_client.post("/quiz/submit", json={"answers": answers})
        assert r.status_code == 200
        data = r.json()
        assert data["score"] == 8
        assert data["passed"] is True
        assert data["token"]

    def test_7_correct_fails(self, preview_client):
        answers = []
        for i in range(1, 16):
            if i <= 7:
                answers.append({"id": i, "option": CORRECT_ANSWERS[i]})
            else:
                answers.append({"id": i, "option": "WRONG"})
        r = preview_client.post("/quiz/submit", json={"answers": answers})
        assert r.status_code == 200
        data = r.json()
        assert data["score"] == 7
        assert data["passed"] is False
        assert data["token"] is None

    def test_missing_question_returns_422(self, preview_client):
        answers = [{"id": i, "option": CORRECT_ANSWERS[i]} for i in range(1, 15)]  # missing id 15
        r = preview_client.post("/quiz/submit", json={"answers": answers})
        assert r.status_code == 422


# --- News removed ---
class TestNewsRemoved:
    def test_news_returns_404(self, preview_client):
        r = preview_client.get("/news")
        assert r.status_code == 404


# --- Admin auth ---
class TestAdminAuth:
    def test_login_success_and_cookie(self, preview_client):
        r = preview_client.post("/auth/login",
                                json={"email": "admin@brq.sa", "password": "brq2026"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == "admin@brq.sa"
        assert data["role"] == "admin"
        # Cookie should be set
        assert "access_token" in preview_client.cookies

    def test_login_invalid(self, preview_client):
        with httpx.Client(base_url=f"{PREVIEW_URL}/api", timeout=30.0) as c:
            r = c.post("/auth/login",
                       json={"email": "admin@brq.sa", "password": "wrong"})
            assert r.status_code == 401
