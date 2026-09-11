import asyncio
import os
import uuid
import random
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlencode, quote

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import bcrypt
import jwt
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from pymongo import ReturnDocument
from starlette.middleware.cors import CORSMiddleware

from lib.db import client, db, ensure_indexes

JWT_ALGORITHM = "HS256"
DISCORD_API = "https://discord.com/api/v10"


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


QUIZ_PASS_SCORE = 8

QUIZ_QUESTIONS = [
    {"id": 1, "question": "ما هو الرول بلاي؟",
     "options": ["تقمص الشخصية بالقول والعمل", "اللعب العشوائي وتجربة السيارات"], "answer": 0},
    {"id": 2, "question": "هل يحق لك الخروج خارج مدينة الرياض إذا كنت في قطاع الدوريات الأمنية أو المرور أثناء الحالة؟",
     "options": ["نعم", "غير مسموح إلا بإذن من ضابط"], "answer": 1},
    {"id": 3, "question": "هل يحق لك الدخول داخل مدينة الرياض إذا كنت في قطاع أمن الطرق أو الشرطة أثناء الحالة؟",
     "options": ["غير مسموح إلا بإذن من ضابط", "نعم"], "answer": 0},
    {"id": 4, "question": "إذا كنت في سيناريو وأُصبت، هل يحق لك العودة لمكان السيناريو؟",
     "options": ["نعم", "يُمنع العودة نهائياً"], "answer": 1},
    {"id": 5, "question": "في حالة الاستيقاف المروري، أين تتوقف الدورية بالنسبة لمركبة المخالف؟",
     "options": ["أمام مركبة المخالف", "خلف مركبة المخالف"], "answer": 1},
    {"id": 6, "question": "في حال كنت برتبة رئيس رقباء، هل يحق لك عمل اصطفاف عسكري؟",
     "options": ["نعم برتبة رئيس رقباء يحق لك", "غير صحيح، الاصطفاف من رتبة ملازم فما فوق", "نعم في الحالات الطارئة فقط"], "answer": 1},
    {"id": 7, "question": "في حالة المطاردة، هل يحق لك صدم مركبة الملاحق؟",
     "options": ["يُمنع الصدم نهائياً", "يحق لك الصدم فوراً", "يحق لك الصدم بعد 3 دقائق"], "answer": 0},
    {"id": 8, "question": "هل يحق لك قطع بلاغ زميلك وإرسال بلاغك في الراديو؟",
     "options": ["نعم إذا كانت حالتك طارئة", "غير صحيح، يجب ترك 5 ثوانٍ بين كل بلاغ وبلاغ"], "answer": 1},
    {"id": 9, "question": "هل يحق لك قطع الإشارة المرورية إذا كنت عسكرياً؟",
     "options": ["نعم في جميع الأوقات", "غير صحيح، فقط في الحالات الجنائية"], "answer": 1},
    {"id": 10, "question": "ما هو مفهوم الـ VDM؟",
     "options": ["الصدم العشوائي", "القتل العشوائي"], "answer": 0},
    {"id": 11, "question": "ما هو مفهوم الـ RDM؟",
     "options": ["الصدم العشوائي بالمركبة", "القتل العشوائي أو القتل بدون سبب"], "answer": 1},
    {"id": 12, "question": "متى يحق لك استعمال السلاح الثقيل؟",
     "options": ["في المطاردات المرورية", "في السيناريوهات فقط"], "answer": 1},
    {"id": 13, "question": "متى يحق لك تشغيل الونانات / السواير؟",
     "options": ["في الحالات الجنائية فقط", "أثناء التجول العادي"], "answer": 0},
    {"id": 14, "question": "هل يحق لك رفع السلاح على المواطن بدون سبب؟",
     "options": ["نعم لحماية نفسك", "غير صحيح، إلا في حال بادر المواطن بإطلاق النار"], "answer": 1},
    {"id": 15, "question": "هل يحق لك تفتيش المواطن بدون سبب؟",
     "options": ["نعم يحق لك دائماً", "لا، يُمنع التفتيش بدون سبب أمني أو بلاغ جنائي"], "answer": 1},
]
QUIZ_BY_ID = {q["id"]: q for q in QUIZ_QUESTIONS}


class LoginIn(BaseModel):
    email: str
    password: str


class AdminUser(BaseModel):
    email: str
    role: str = "admin"


class ApplicationCreate(BaseModel):
    full_name: str = Field(min_length=3, max_length=80)
    discord_tag: str = Field(min_length=2, max_length=60)
    age: int = Field(ge=13, le=99)
    fivem_hours: int = Field(ge=0, le=100000)
    division: str = Field(min_length=2, max_length=60)
    scenario_answer: str = Field(min_length=20, max_length=2000)
    agreed_rules: bool


class Application(ApplicationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"
    note: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApplicationStatusIn(BaseModel):
    status: str
    note: str = ""


class QuizQuestionOut(BaseModel):
    id: int
    question: str
    options: List[str]


class QuizAnswer(BaseModel):
    id: int
    option: str


class QuizSubmit(BaseModel):
    answers: List[QuizAnswer]


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    token: Optional[str] = None


async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({"email": email, "password_hash": hash_password(password),
                                   "role": "admin", "created_at": datetime.now(timezone.utc)})
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await db.applications.create_index("id", unique=True)
    await db.applications.create_index("status")
    await seed_admin()
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="غير مصرح")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="جلسة غير صالحة")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح")
    return payload


@api_router.get("/")
async def root():
    return {"message": "BRQ Saudi Police Mod API"}


# ---------- Admin Auth ----------

@api_router.post("/auth/login", response_model=AdminUser)
async def login(body: LoginIn, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    token = jwt.encode(
        {"sub": email, "role": user.get("role", "admin"),
         "exp": datetime.now(timezone.utc) + timedelta(hours=12)},
        jwt_secret(), algorithm=JWT_ALGORITHM)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=12 * 3600, path="/")
    return AdminUser(email=email, role=user.get("role", "admin"))


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=AdminUser)
async def me(admin: dict = Depends(get_current_admin)):
    return AdminUser(email=admin["sub"], role=admin["role"])


# ---------- Applications ----------

@api_router.post("/applications", response_model=Application)
async def create_application(body: ApplicationCreate):
    if not body.agreed_rules:
        raise HTTPException(status_code=422, detail="يجب الموافقة على القوانين")
    app_obj = Application(**body.model_dump())
    await db.applications.insert_one(app_obj.model_dump())
    return app_obj


@api_router.get("/admin/applications", response_model=List[Application])
async def list_applications(status: str = "", admin: dict = Depends(get_current_admin)):
    query = {"status": status} if status else {}
    docs = await db.applications.find(query).sort("created_at", -1).to_list(500)
    return [Application(**d) for d in docs]


@api_router.patch("/admin/applications/{app_id}", response_model=Application)
async def update_application(app_id: str, body: ApplicationStatusIn, admin: dict = Depends(get_current_admin)):
    if body.status not in ("pending", "accepted", "rejected"):
        raise HTTPException(status_code=400, detail="حالة غير صالحة")
    doc = await db.applications.find_one_and_update(
        {"id": app_id}, {"$set": {"status": body.status, "note": body.note}},
        return_document=ReturnDocument.AFTER)
    if not doc:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return Application(**doc)


# ---------- Quiz ----------

@api_router.get("/quiz/questions", response_model=List[QuizQuestionOut])
async def quiz_questions():
    qs = random.sample(QUIZ_QUESTIONS, len(QUIZ_QUESTIONS))
    return [QuizQuestionOut(id=q["id"], question=q["question"], options=random.sample(q["options"], len(q["options"])))
            for q in qs]


@api_router.post("/quiz/submit", response_model=QuizResult)
async def quiz_submit(body: QuizSubmit):
    ids = {a.id for a in body.answers}
    if ids != set(QUIZ_BY_ID):
        raise HTTPException(status_code=422, detail="يجب الإجابة على جميع الأسئلة")
    score = sum(1 for a in body.answers if QUIZ_BY_ID[a.id]["options"][QUIZ_BY_ID[a.id]["answer"]] == a.option)
    total = len(QUIZ_QUESTIONS)
    passed = score >= QUIZ_PASS_SCORE
    token = None
    if passed:
        token = jwt.encode(
            {"type": "quiz_pass", "score": score,
             "exp": datetime.now(timezone.utc) + timedelta(minutes=30)},
            jwt_secret(), algorithm=JWT_ALGORITHM)
    return QuizResult(score=score, total=total, passed=passed, token=token)


# ---------- Discord OAuth2 + Bot Role Grant ----------

def discord_configured() -> bool:
    return all(os.environ.get(k) for k in (
        "DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_BOT_TOKEN",
        "DISCORD_GUILD_ID", "DISCORD_ROLE_ID", "DISCORD_REDIRECT_URI"))


def verify_pass_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        return payload.get("type") == "quiz_pass"
    except jwt.PyJWTError:
        return False


@api_router.get("/discord/login")
async def discord_login(token: str):
    if not verify_pass_token(token):
        raise HTTPException(status_code=401, detail="انتهت صلاحية رمز الاجتياز — أعد الاختبار")
    if not discord_configured():
        raise HTTPException(status_code=503, detail="discord_not_configured")
    params = urlencode({
        "client_id": os.environ["DISCORD_CLIENT_ID"],
        "redirect_uri": os.environ["DISCORD_REDIRECT_URI"],
        "response_type": "code",
        "scope": "identify guilds.join",
        "state": token,
    })
    return {"url": f"https://discord.com/oauth2/authorize?{params}"}


@api_router.get("/discord/callback")
async def discord_callback(code: str = "", state: str = ""):
    def fail(reason: str) -> RedirectResponse:
        return RedirectResponse(f"/discord/result?status=fail&reason={reason}")

    if not discord_configured():
        return fail("config")
    if not state or not verify_pass_token(state):
        return fail("state")
    if not code:
        return fail("denied")
    async with httpx.AsyncClient(timeout=20) as http:
        token_res = await http.post(f"{DISCORD_API}/oauth2/token", data={
            "client_id": os.environ["DISCORD_CLIENT_ID"],
            "client_secret": os.environ["DISCORD_CLIENT_SECRET"],
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": os.environ["DISCORD_REDIRECT_URI"],
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        if token_res.status_code != 200:
            return fail("token")
        access = token_res.json().get("access_token", "")
        user_res = await http.get(f"{DISCORD_API}/users/@me",
                                  headers={"Authorization": f"Bearer {access}"})
        if user_res.status_code != 200:
            return fail("user")
        user = user_res.json()
        uid = user["id"]
        username = user.get("global_name") or user.get("username", "")
        bot = {"Authorization": f"Bot {os.environ['DISCORD_BOT_TOKEN']}"}
        guild_id = os.environ["DISCORD_GUILD_ID"]
        await http.put(f"{DISCORD_API}/guilds/{guild_id}/members/{uid}",
                       json={"access_token": access}, headers=bot)
        role_res = await http.put(
            f"{DISCORD_API}/guilds/{guild_id}/members/{uid}/roles/{os.environ['DISCORD_ROLE_ID']}",
            headers=bot)
        if role_res.status_code not in (200, 204):
            return fail("role")
    await db.discord_grants.insert_one(
        {"user_id": uid, "username": username, "granted_at": datetime.now(timezone.utc)})
    return RedirectResponse(f"/discord/result?status=success&user={quote(username)}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
