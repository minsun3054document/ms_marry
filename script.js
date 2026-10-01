/*
 * 청첩장 정보는 아래 WEDDING 객체에서 한 번에 수정할 수 있습니다.
 * 예식 정보가 바뀌면 아래 항목만 수정하세요.
 */
const WEDDING = {
  groomName: "김현수",
  brideName: "이민선",
  groomParents: "김태형 · 한유경",
  brideParents: "이기복 · 김봉자",
  date: "2030.05.31 FRI",
  dateISO: "2030-05-31T18:30:00+09:00",
  time: "오후 6시 30분",
  year: "2030",
  venue: "시그니엘 서울 · 그랜드볼룸",
  address: "서울 송파구 올림픽로 300, 롯데월드타워 76층",
  subway: "2호선 잠실역 2번 출구 도보 3분 · 8호선 잠실역 11번 출구 도보 7분",
  bus: "잠실역·롯데월드몰 정류장 하차 후 롯데월드타워 방향으로 이동해 주세요.",
  parking: "롯데월드타워 지하주차장 이용 · 주차 등록은 예식 당일 안내데스크에 문의해 주세요.",
  brideBank: "NH농협",
  brideAccount: "356-1114-0140-93",
  brideAccountHolder: "예금주 이민선",
  mapLinks: {
    naver: "https://map.naver.com/p/search/%EC%8B%9C%EA%B7%B8%EB%8B%88%EC%97%98%20%EC%84%9C%EC%9A%B8",
    kakao: "https://map.kakao.com/?q=%EC%8B%9C%EA%B7%B8%EB%8B%88%EC%97%98%20%EC%84%9C%EC%9A%B8",
  },
};

const GUESTBOOK = {
  repository: "minsun3054document/ms_marry",
  apiUrl: "https://api.github.com/repos/minsun3054document/ms_marry/issues?state=open&labels=guestbook&sort=created&direction=desc&per_page=30",
  newIssueUrl: "https://github.com/minsun3054document/ms_marry/issues/new",
};

const galleryImages = [
  { src: "assets/photo-01.webp", alt: "웨딩드레스와 턱시도를 입고 함께 미소 짓는 두 사람" },
  { src: "assets/photo-02.webp", alt: "손으로 하트를 만들고 있는 신랑과 신부" },
  { src: "assets/photo-03.webp", alt: "나란히 앉아 장난스러운 표정을 짓는 신랑과 신부" },
];

document.querySelectorAll("[data-field]").forEach((element) => {
  const value = WEDDING[element.dataset.field];
  if (typeof value === "string") element.textContent = value;
});

document.title = `${WEDDING.groomName} & ${WEDDING.brideName} 결혼합니다`;

const weddingDate = new Date(WEDDING.dateISO);
const daysUntilWedding = Math.ceil((weddingDate.getTime() - Date.now()) / 86_400_000);
const dDay = document.querySelector("#d-day");
if (daysUntilWedding > 0) dDay.textContent = `D-${daysUntilWedding.toLocaleString("ko-KR")}`;
else if (daysUntilWedding === 0) dDay.textContent = "D-DAY";
else dDay.textContent = "JUST MARRIED";

const progress = document.querySelector(".page-progress span");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panel = trigger.nextElementSibling;
    const willOpen = trigger.getAttribute("aria-expanded") !== "true";
    trigger.setAttribute("aria-expanded", String(willOpen));
    panel.hidden = !willOpen;
  });
});

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    showToast(successMessage);
  }
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", () => {
    const account = WEDDING[button.dataset.copyField];
    copyText(account, "계좌번호를 복사했어요.");
  });
});

document.querySelectorAll(".route-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.route === "address") {
      copyText(WEDDING.address, "예식장 주소를 복사했어요.");
      return;
    }
    const url = WEDDING.mapLinks[button.dataset.route];
    if (!url) {
      showToast("길찾기 링크를 확인해 주세요.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  });
});

const guestbookForm = document.querySelector("#guestbook-form");
const guestbookList = document.querySelector("#guestbook-list");

function createGuestbookMessage(issue) {
  const article = document.createElement("article");
  article.className = "guestbook-message";

  const header = document.createElement("div");
  const name = document.createElement("strong");
  const date = document.createElement("time");
  const message = document.createElement("p");

  name.textContent = issue.title.replace(/^\[축하\]\s*/, "") || issue.user.login;
  date.dateTime = issue.created_at;
  date.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(issue.created_at));
  message.textContent = (issue.body || "축하합니다!").split("\n\n---")[0].trim();

  header.append(name, date);
  article.append(header, message);
  return article;
}

async function loadGuestbook() {
  try {
    const response = await fetch(GUESTBOOK.apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`Guestbook request failed: ${response.status}`);
    const issues = (await response.json()).filter((issue) => !issue.pull_request);
    guestbookList.replaceChildren();

    if (!issues.length) {
      const empty = document.createElement("p");
      empty.className = "guestbook-list__status";
      empty.textContent = "첫 번째 축하 메시지를 남겨 주세요.";
      guestbookList.append(empty);
      return;
    }

    issues.forEach((issue) => guestbookList.append(createGuestbookMessage(issue)));
  } catch {
    guestbookList.innerHTML = '<p class="guestbook-list__status">첫 번째 축하 메시지를 남겨 주세요.</p>';
  }
}

guestbookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#guest-name").value.trim();
  const message = document.querySelector("#guest-message").value.trim();
  if (!name || !message) return;

  const params = new URLSearchParams({
    title: `[축하] ${name}`,
    body: `${message}\n\n---\n모바일 청첩장에서 남긴 메시지입니다.`,
    labels: "guestbook",
  });
  window.open(`${GUESTBOOK.newIssueUrl}?${params.toString()}`, "_blank", "noopener,noreferrer");
  showToast("GitHub에서 등록을 완료해 주세요.");
});

loadGuestbook();

document.querySelector("#copy-link-button").addEventListener("click", () => {
  copyText(window.location.href, "초대장 링크를 복사했어요.");
});

document.querySelector("#share-button").addEventListener("click", async () => {
  const shareData = {
    title: `${WEDDING.groomName} & ${WEDDING.brideName} 결혼합니다`,
    text: `${WEDDING.date} ${WEDDING.time} · ${WEDDING.venue}`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== "AbortError") showToast("공유하지 못했어요. 다시 시도해 주세요.");
    }
  } else {
    copyText(window.location.href, "초대장 링크를 복사했어요.");
  }
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("figure img");
const lightboxCount = lightbox.querySelector("figcaption span");
let currentImageIndex = 0;

function renderLightbox(index) {
  currentImageIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[currentImageIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCount.textContent = String(currentImageIndex + 1).padStart(2, "0");
}

document.querySelectorAll(".gallery-item").forEach((button) => {
  button.addEventListener("click", () => {
    renderLightbox(Number(button.dataset.image));
    lightbox.showModal();
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.close();
  document.body.style.overflow = "";
}

lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox__arrow--prev").addEventListener("click", () => renderLightbox(currentImageIndex - 1));
lightbox.querySelector(".lightbox__arrow--next").addEventListener("click", () => renderLightbox(currentImageIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener("close", () => {
  document.body.style.overflow = "";
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") renderLightbox(currentImageIndex - 1);
  if (event.key === "ArrowRight") renderLightbox(currentImageIndex + 1);
});

let touchStartX = null;
lightbox.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true },
);
lightbox.addEventListener(
  "touchend",
  (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) renderLightbox(currentImageIndex + (delta < 0 ? 1 : -1));
    touchStartX = null;
  },
  { passive: true },
);
