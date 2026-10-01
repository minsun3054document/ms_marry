/*
 * 청첩장 정보는 아래 WEDDING 객체에서 한 번에 수정할 수 있습니다.
 * 날짜가 확정되면 date에 YYYY.MM.DD 형식으로 입력하세요.
 */
const WEDDING = {
  groomName: "김현수",
  brideName: "이민선",
  groomParents: "김태형 · 한유경",
  brideParents: "이기복 · 김봉자",
  date: "2000.00.00",
  time: "00시 00분",
  year: "2000",
  venue: "예식장 이름 · 예식홀",
  address: "예식장 주소가 입력될 예정입니다.",
  subway: "가까운 역과 출구 정보를 입력해 주세요.",
  bus: "정류장과 버스 번호를 입력해 주세요.",
  parking: "주차장 이용 정보를 입력해 주세요.",
  brideBank: "NH농협",
  brideAccount: "356-1114-0140-93",
  brideAccountHolder: "예금주 이민선",
  mapLinks: {
    naver: "",
    kakao: "",
    tmap: "",
  },
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
    const url = WEDDING.mapLinks[button.dataset.route];
    if (!url) {
      showToast("예식장 확정 후 길찾기가 연결됩니다.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  });
});

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
