document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector(".sticky-scene");
  const cards = document.querySelectorAll(".card");
  if (!scene || cards.length === 0) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ===== 타이밍 =====
  const riseStart = 0.45;
  const riseEnd = 0.9;

  const driftStart = 0.9;
  const driftEnd = 1.25;

  const fadeStart = 1.05;
  const fadeGap = 0.07;
  const fadeDur = 0.22;

  function onScroll() {
    const rect = scene.getBoundingClientRect();
    const vh = window.innerHeight;

    const progress = clamp((vh - rect.top) / rect.height, 0, 1.2);

    // 1) 밑에서 제자리까지 올라오기
    const riseT = clamp((progress - riseStart) / (riseEnd - riseStart), 0, 1);
    const startY = vh * 1.25;
    const riseY = (1 - riseT) * startY;

    // 2) 제자리 도착 후에도 계속 위로 밀어올리기
    const driftT = clamp(
      (progress - driftStart) / (driftEnd - driftStart),
      0,
      1,
    );
    const driftY = vh * 0.65;
    const extraUp = driftT * driftY;

    cards.forEach((card, i) => {
      const y = riseY - extraUp;
      const s = 0.94 + riseT * 0.06;

      // 3) 상단 근처부터 순차 페이드
      const cardFadeStart = fadeStart + i * fadeGap;
      const fadeT = clamp((progress - cardFadeStart) / fadeDur, 0, 1);
      const opacity = 1 - fadeT;

      card.style.transform = `translateY(${y}px) scale(${s})`;
      card.style.opacity = opacity;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}); // ✅ 이 줄이 반드시 있어야 함!

/* ===== ABOUT 텍스트 컬러 단계 ===== */
/* ===== ABOUT 텍스트 컬러 채움 (sticky 구간 기준) ===== */
(() => {
  const section = document.querySelector("#about");
  const quote = document.querySelector(".js-about-quote");
  if (!section || !quote) return;

  const lines = quote.querySelectorAll(".line");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // ✅ about-scene(예: 260vh)에서 sticky(100vh)를 제외한 나머지가 "진행 구간"
    const total = section.offsetHeight - vh; // 진행 가능한 스크롤 길이
    const passed = clamp(-rect.top, 0, total); // 섹션 안에서 얼마나 지나왔는지
    const progress = total > 0 ? passed / total : 0; // 0~1

    // ✅ 시작을 조금 늦추고 싶으면 (지금 너 느낌 유지)
    // 기존에 start/end로 늦춘 느낌과 비슷하게 만들기
    const delayed = clamp((progress - 0.0) / 0.9, 0, 1);

    lines.forEach((line, i) => {
      const fill = line.querySelector(".fill");
      if (!fill) return;

      const segStart = i / lines.length;
      const segEnd = (i + 1) / lines.length;

      const t = clamp((delayed - segStart) / (segEnd - segStart), 0, 1);

      const steps = 18; // 너가 쓰던 값 그대로
      const stepped = Math.round(t * steps) / steps;

      fill.style.width = `${stepped * 100}%`;
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// behind
document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#behind");
  const viewport = section?.querySelector(".behind-viewport");
  const track = section?.querySelector(".behind-track");
  const panels = gsap.utils.toArray(
    section?.querySelectorAll(".bh-panel") || [],
  );

  if (!section || !viewport || !track || panels.length === 0) return;

  const getMaxX = () => {
    const tr = getComputedStyle(track);
    const pr = parseFloat(tr.paddingRight) || 0; // ✅ track padding-right 읽기
    const safety = 100; // ⭐ 40~120 사이로 조절 (일단 60 추천)

    // ✅ scrollWidth는 track padding 포함. 그래도 마지막이 1~2px 모자랄 수 있어서 safety 더함
    return Math.max(
      0,
      Math.ceil(track.scrollWidth - viewport.clientWidth + safety),
    );
  };

  const moveTween = gsap.to(track, {
    x: () => -getMaxX(),
    ease: "none",
    paused: true,
  });

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => "+=" + (getMaxX() + window.innerHeight * 0.8),
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: moveTween,
    invalidateOnRefresh: true,
  });

  // ✅ 패널 등장(너가 쓰던 그대로)
  panels.forEach((panel, i) => {
    const card = panel.querySelector(".bh-card");
    const sticker = panel.querySelector(".bh-sticker");
    if (!card) return;

    const fromY = i % 2 === 0 ? -140 : 140;

    gsap.set(card, { opacity: 0, y: fromY });
    if (sticker) {
      gsap.set(sticker, {
        opacity: 0,
        y: fromY * 0.5,
        scale: 0.85,
        rotate: -10,
      });
    }

    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      immediateRender: false,
      scrollTrigger: {
        trigger: panel,
        containerAnimation: moveTween,
        start: "left 55%",
        end: "left 55%",
        toggleActions: "play none none reverse",
      },
    });

    if (sticker) {
      gsap.to(sticker, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: -8,
        duration: 0.45,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: panel,
          containerAnimation: moveTween,
          start: "left 55%",
          end: "left 55%",
          toggleActions: "play none none reverse",
        },
      });
    }
  });

  // ✅ 핵심: 이미지 로드 후 scrollWidth가 바뀌면 마지막 카드가 잘리니까 반드시 refresh
  const imgs = track.querySelectorAll("img");
  const waitImages = () =>
    Promise.all(
      [...imgs].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
            }),
      ),
    );

  waitImages().then(() => {
    ScrollTrigger.refresh(); // ✅ 이거 때문에 마지막 카드가 해결되는 경우가 많음
  });

  window.addEventListener("resize", () => ScrollTrigger.refresh());
});

// 마지막 라인 애니메이션이 끝나면 라벨 표시
/* =========================
   Scrolla 트리거 + USER 섹션(선/화살표/텍스트) 반복 애니메이션
   - scrolla(once:false)가 .user-motion 클래스를 붙였다 떼면
   - 그 "클래스 변화"를 감지해서 JS 애니메이션을 매번 재실행
   ========================= */

/* 0) scrolla 초기화 (jQuery / scrolla 로드된 뒤 실행) */
$(function () {
  $(".animate").scrolla({
    mobile: true,
    once: false, // ✅ 스크롤 인/아웃 할 때마다 반복
  });
});

/* 1) USER 섹션 애니메이션 실행 함수 */
function runUserLineAnimation(groupEl) {
  // 혹시 이전 타이머가 남아있으면 정리
  if (groupEl.__userTimers && groupEl.__userTimers.length) {
    groupEl.__userTimers.forEach((t) => clearTimeout(t));
  }
  groupEl.__userTimers = [];

  // ✅ 들어올 때마다 화살표/텍스트는 일단 숨김(리셋)
  groupEl.querySelectorAll(".user-arrow, .user-abs-text").forEach((el) => {
    el.classList.remove("is-visible");
  });

  const duration = 1200;
  const showArrowAt = Math.round(duration * 0.8);
  const showTextAt = showArrowAt + 200;

  // 그룹 내부의 두 SVG 모두 처리
  const svgs = groupEl.querySelectorAll(".user-svg");

  svgs.forEach((svg) => {
    const path = svg.querySelector(".user-line");
    if (!path) return;

    const length = path.getTotalLength();

    // ✅ 반복 재생을 위해 항상 초기화 (transition 끄고 dash 세팅)
    path.style.transition = "none";
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = -length;

    // 리플로우로 초기 상태 확정
    path.getBoundingClientRect();

    // ✅ 다시 그리기 시작
    path.style.transition = `stroke-dashoffset ${duration}ms ease`;
    path.style.strokeDashoffset = 0;

    // left/right 매칭
    const isLeft = svg.classList.contains("user-svg--left");

    const arrow = groupEl.querySelector(
      isLeft ? ".user-arrow--left" : ".user-arrow--right",
    );

    const text = groupEl.querySelector(
      isLeft ? ".user-abs-text--left" : ".user-abs-text--right",
    );

    // 화살표 등장
    groupEl.__userTimers.push(
      setTimeout(() => {
        arrow?.classList.add("is-visible");
      }, showArrowAt),
    );

    // 텍스트 등장
    groupEl.__userTimers.push(
      setTimeout(() => {
        text?.classList.add("is-visible");
      }, showTextAt),
    );
  });
}

/* 2) scrolla가 붙이는 클래스 변화를 감지해서 실행/리셋 */
(function bindUserScrollaBridge() {
  // scrolla 타겟(animate) 중에서 user 모션을 받을 그룹만 선택
  const groups = document.querySelectorAll(".user-anim-group");
  if (!groups.length) return;

  groups.forEach((group) => {
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes" || m.attributeName !== "class") continue;

        // ✅ scrolla가 data-animate 값(=user-motion)을 class로 붙임
        const active = group.classList.contains("user-motion");

        if (active) {
          // 화면 진입 → 애니메이션 실행
          runUserLineAnimation(group);
        } else {
          // 화면 이탈 → 화살표/텍스트 숨김 + 타이머 정리
          if (group.__userTimers && group.__userTimers.length) {
            group.__userTimers.forEach((t) => clearTimeout(t));
            group.__userTimers = [];
          }
          group
            .querySelectorAll(".user-arrow, .user-abs-text")
            .forEach((el) => {
              el.classList.remove("is-visible");
            });

          // 선도 숨김 상태로 되돌리고 싶으면(선도 반복 시 깔끔)
          group.querySelectorAll(".user-line").forEach((path) => {
            try {
              const length = path.getTotalLength();
              path.style.transition = "none";
              path.style.strokeDasharray = length;
              path.style.strokeDashoffset = -length;
            } catch (e) {}
          });
        }
      }
    });

    obs.observe(group, { attributes: true });

    // 혹시 로드시 이미 활성 상태면 바로 실행
    if (group.classList.contains("user-motion")) {
      runUserLineAnimation(group);
    }
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const area = document.querySelector("#recruit-section");
  const magnifier = document.querySelector(".recruit-magnifier");
  if (!area || !magnifier) return;

  // ✅ 체감 키우는 값들
  const MAX_X = 140; // 좌우 반응 폭 (70 -> 140)
  const MAX_Y = 90; // 상하 반응 폭 (45 -> 90)

  const POWER_X = 1.35;
  const POWER_Y = 1.1; // ✅ Y는 덜 휘어지게

  const FOLLOW_X = 0.14;
  const FOLLOW_Y = 0.22; // ✅ Y는 더 빨리 따라오게

  let tx = 0,
    ty = 0; // 목표
  let x = 0,
    y = 0; // 현재(lerp)
  let raf = null;
  let active = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function tick() {
    // lerp(관성)
    x += (tx - x) * FOLLOW_X;
    y += (ty - y) * FOLLOW_Y;

    magnifier.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    // active거나 아직 목표에 덜 도착했으면 계속
    const moving = Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2;

    if (active || moving) raf = requestAnimationFrame(tick);
    else raf = null;
  }

  function ensureRAF() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  area.addEventListener("mouseenter", () => {
    active = true;
    magnifier.classList.add("is-following");
    ensureRAF();
  });

  area.addEventListener("mousemove", (e) => {
    const rect = area.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1

    // -1..1
    let dx = (nx - 0.5) * 2;
    let dy = (ny - 0.5) * 2;

    // ✅ 가속 곡선(가장자리에서 더 크게)
    dx = Math.sign(dx) * Math.pow(Math.abs(dx), POWER_X);
    dy = Math.sign(dy) * Math.pow(Math.abs(dy), POWER_Y);

    tx = clamp(dx * MAX_X, -MAX_X, MAX_X);
    ty = clamp(dy * MAX_Y, -MAX_Y, MAX_Y);

    ensureRAF();
  });

  area.addEventListener("mouseleave", () => {
    active = false;
    magnifier.classList.remove("is-following");

    // ✅ 원위치로 돌아가게 목표를 0,0
    tx = 0;
    ty = 0;
    ensureRAF();
  });
});

const section = document.querySelector("#recruit-section");
const clouds = document.querySelector(".recruit-clouds");

function onScroll() {
  const vh = window.innerHeight;
  const sRect = section.getBoundingClientRect();

  const total = section.offsetHeight - vh; // 진행 가능 스크롤
  const passed = Math.min(Math.max(-sRect.top, 0), total);
  const progress = total > 0 ? passed / total : 0; // 0~1

  if (progress >= 0.75) {
    clouds.classList.add("clouds-on");
  } else {
    clouds.classList.remove("clouds-on");
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

function preloadReviewImages() {
  document.querySelectorAll(".review-card img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    const i = new Image();
    i.src = src;
  });
}
preloadReviewImages();

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".review-track");
  const viewport = document.querySelector(".review-viewport");
  const btnPrev = document.querySelector(".review-btn--prev");
  const btnNext = document.querySelector(".review-btn--next");

  if (!track || !viewport || !btnPrev || !btnNext) return;

  // 🔒 중복 실행 방지
  if (track.dataset.reviewInited === "1") return;
  track.dataset.reviewInited = "1";

  const cards = [...track.querySelectorAll(".review-card")];
  if (!cards.length) return;

  let index = 0;
  let step = 0;

  const getGap = () => {
    const s = getComputedStyle(track);
    return parseFloat(s.gap || s.columnGap) || 0;
  };

  const recalcStep = () => {
    step = cards[0].offsetWidth + getGap();
  };

  const setTransition = (on) => {
    track.style.transition = on
      ? "transform 520ms cubic-bezier(0.22,1,0.36,1)"
      : "none";
  };

  const clampIndex = (i) => Math.max(0, Math.min(cards.length - 1, i));

  const goTo = (nextIndex, animate = true) => {
    index = clampIndex(nextIndex);
    setTransition(animate);
    track.style.transform = `translate3d(${-(index * step)}px,0,0)`;
    updateBtns();
  };

  const updateBtns = () => {
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === cards.length - 1;

    // 원하면 비활성 스타일 주기 쉽게 클래스도 같이
    btnPrev.classList.toggle("is-disabled", btnPrev.disabled);
    btnNext.classList.toggle("is-disabled", btnNext.disabled);
  };

  // 버튼
  btnPrev.addEventListener("click", () => goTo(index - 1, true));
  btnNext.addEventListener("click", () => goTo(index + 1, true));

  // =========================
  // 드래그(포인터) 스와이프
  // =========================
  let isDown = false;
  let startX = 0;
  let startTranslate = 0;
  let curTranslate = 0;

  const getX = () => {
    const t = getComputedStyle(track).transform;
    if (!t || t === "none") return 0;
    return new DOMMatrixReadOnly(t).m41 || 0;
  };

  const threshold = () => Math.max(70, step * 0.15);

  const onDown = (e) => {
    // 버튼 쪽에서 드래그 시작해도 되면 이 줄 삭제해도 됨
    isDown = true;
    viewport.setPointerCapture(e.pointerId);

    setTransition(false);
    startX = e.clientX;
    startTranslate = getX();
    curTranslate = startTranslate;
  };

  const onMove = (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    curTranslate = startTranslate + dx;

    // ✅ 끝에서는 더 못 끌게 살짝 저항 주기
    const minX = -(step * (cards.length - 1));
    const maxX = 0;

    if (curTranslate > maxX) curTranslate = maxX + (curTranslate - maxX) * 0.35;
    if (curTranslate < minX) curTranslate = minX + (curTranslate - minX) * 0.35;

    track.style.transform = `translate3d(${curTranslate}px,0,0)`;
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;

    const dx = curTranslate - startTranslate;

    if (dx < -threshold()) goTo(index + 1, true);
    else if (dx > threshold()) goTo(index - 1, true);
    else goTo(index, true);
  };

  viewport.style.touchAction = "pan-y";
  viewport.addEventListener("pointerdown", onDown);
  viewport.addEventListener("pointermove", onMove);
  viewport.addEventListener("pointerup", onUp);
  viewport.addEventListener("pointercancel", onUp);
  viewport.addEventListener("pointerleave", onUp);

  // 초기 세팅
  recalcStep();
  goTo(0, false);

  window.addEventListener("resize", () => {
    recalcStep();
    goTo(index, false);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#clock");
  const wrap = section?.querySelector(".clock-wrap");
  const hour = section?.querySelector(".clock-hand.hour");
  const minute = section?.querySelector(".clock-hand.minute");
  const second = section?.querySelector(".clock-hand.second");
  const face = section?.querySelector(".clock-face");

  if (!section || !wrap || !hour || !minute || !second || !face) return;

  // ✅ 화면을 "꽉 차는" 스케일 목표값
  // (두 번째 이미지처럼 가장자리 잘리게 하려면 1.35~1.65 사이에서 맞춰짐)
  const getFillScale = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // face 실제 렌더 폭(시작 스케일 고려 전)
    const r = face.getBoundingClientRect();
    const w = r.width;
    const h = r.height;

    // 화면을 꽉 채우려면 더 큰 축 기준으로 맞추기
    const sx = vw / w;
    const sy = vh / h;

    // 가장자리 "조금" 더 잘리게 여유(1.03~1.10 정도)
    return Math.max(sx, sy) * 1.02;
  };

  // 초기 회전값 세팅(깜빡임 방지)
  gsap.set([hour, minute, second], { rotate: 0 });
  gsap.set(wrap, { scale: 1, transformOrigin: "50% 50%" });

  let tl;

  const build = () => {
    if (tl) tl.kill();

    const fillScale = getFillScale();

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + window.innerHeight * 0.8, // ✅ pin 유지 길이(조절)
        scrub: 1,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
      },
    });

    // 1) 줌인: 여유있게 보이다가 → 꽉 차는 순간까지
    tl.to(
      wrap,
      {
        scale: fillScale,
        ease: "none",
      },
      0,
    );

    // 2) 바늘 회전(스크롤 진행에 비례)
    //    - second: 더 많이 돌게(빠른 초침 느낌)
    //    - minute: 중간
    //    - hour: 천천히
    tl.to(second, { rotate: 360 * 6, ease: "none" }, 0); // ✅ 6바퀴
    tl.to(minute, { rotate: 360 * 1.5, ease: "none" }, 0); // ✅ 1.5바퀴
    tl.to(hour, { rotate: 360 * 0.25, ease: "none" }, 0); // ✅ 1/4바퀴
  };

  build();
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
    build();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll("[data-core]");
  if (!items.length) return;

  // 중앙 근처만 "is-center" 되도록 rootMargin을 위/아래로 강하게 줄임
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-center", entry.isIntersecting);
      });
    },
    {
      root: null,
      // ✅ 가운데 10~20% 영역쯤 들어왔을 때만 true 느낌
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0.01,
    },
  );

  items.forEach((el) => io.observe(el));
});
