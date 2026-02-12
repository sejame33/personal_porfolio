document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  if (!header) return;

  let lastY = window.scrollY;
  const topThreshold = 10;
  const deltaThreshold = 6;

  // ✅ 스크롤이 결정하는 compact 여부
  let shouldCompact = false;

  // ✅ 마우스 올려져 있는지
  let isHovering = false;

  const applyState = () => {
    header.classList.toggle("is-compact", shouldCompact && !isHovering);
  };

  // hover 시 full 버전 강제
  header.addEventListener("mouseenter", () => {
    isHovering = true;
    applyState();
  });

  header.addEventListener("mouseleave", () => {
    isHovering = false;
    applyState();
  });

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const diff = y - lastY;

      // 맨 위 근처는 항상 full
      if (y <= topThreshold) {
        shouldCompact = false;
        applyState();
        lastY = y;
        return;
      }

      if (Math.abs(diff) < deltaThreshold) return;

      if (diff > 0) {
        // 아래로 스크롤 → compact
        shouldCompact = true;
      } else {
        // 위로 스크롤 → full
        shouldCompact = false;
      }

      applyState();
      lastY = y;
    },
    { passive: true },
  );
});

(() => {
  const hero = document.querySelector(".hero");
  const btn = document.querySelector(".scroll-down-btn");
  const line = document.querySelector(".scroll-down-btn .scroll-line");
  if (!hero || !btn || !line) return;

  let maxHeight = 0;
  let ticking = false;

  const measure = () => {
    // 뷰포트 기준 좌표로 거리 계산
    const heroRect = hero.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // 버튼 아래(선 시작점) ~ hero 바닥까지 거리(px)
    const gap = 10; // CSS margin-top이 10px면 동일하게
    maxHeight = Math.max(0, heroRect.bottom - (btnRect.bottom + gap));
  };

  const update = () => {
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const triggerRange = hero.offsetHeight * 0.8; // 너가 원한 빠른 채움 구간

    let progress = -rect.top / triggerRange;
    progress = Math.min(Math.max(progress, 0), 1);

    line.style.height = `${progress * maxHeight}px`;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  // 최초 측정
  measure();
  update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    update();
  });
})();

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
// behind (safe: only kills triggers created in this block)
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

  const mqMobile = window.matchMedia("(max-width: 500px)");

  let moveTween = null;
  let pinST = null;
  let cleanupFns = []; // panel triggers kill용

  const killBehind = () => {
    // ✅ behind에서 만든 패널 트리거들 kill
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];

    // ✅ pin + moveTween kill
    if (pinST) {
      pinST.kill();
      pinST = null;
    }
    if (moveTween) {
      moveTween.kill();
      moveTween = null;
    }

    // ✅ 트랙 이동 잔상 제거
    gsap.set(track, { clearProps: "transform" });
  };

  const addPanelRevealVertical = () => {
    panels.forEach((panel) => {
      const card = panel.querySelector(".bh-card");
      const sticker = panel.querySelector(".bh-sticker");
      if (!card) return;

      gsap.set(card, { opacity: 0, y: 60 });
      if (sticker)
        gsap.set(sticker, { opacity: 0, y: 20, scale: 0.9, rotate: -10 });

      const st1 = ScrollTrigger.create({
        trigger: panel,
        start: "top 85%",
        onEnter: () =>
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          }),
        onLeaveBack: () =>
          gsap.to(card, {
            opacity: 0,
            y: 60,
            duration: 0.3,
            ease: "power2.out",
          }),
      });

      let st2 = null;
      if (sticker) {
        st2 = ScrollTrigger.create({
          trigger: panel,
          start: "top 85%",
          onEnter: () =>
            gsap.to(sticker, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: -8,
              duration: 0.45,
              ease: "power2.out",
            }),
          onLeaveBack: () =>
            gsap.to(sticker, {
              opacity: 0,
              y: 20,
              scale: 0.9,
              rotate: -10,
              duration: 0.3,
              ease: "power2.out",
            }),
        });
      }

      cleanupFns.push(() => {
        st1.kill();
        if (st2) st2.kill();
      });
    });
  };

  const addPanelRevealHorizontal = () => {
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

      const t1 = gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        paused: true,
      });

      const st1 = ScrollTrigger.create({
        trigger: panel,
        containerAnimation: moveTween,
        start: "left 55%",
        toggleActions: "play none none reverse",
        onEnter: () => t1.play(),
        onLeaveBack: () => t1.reverse(),
      });

      let t2 = null;
      let st2 = null;
      if (sticker) {
        t2 = gsap.to(sticker, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: -8,
          duration: 0.45,
          ease: "power2.out",
          paused: true,
        });

        st2 = ScrollTrigger.create({
          trigger: panel,
          containerAnimation: moveTween,
          start: "left 55%",
          toggleActions: "play none none reverse",
          onEnter: () => t2.play(),
          onLeaveBack: () => t2.reverse(),
        });
      }

      cleanupFns.push(() => {
        st1.kill();
        t1.kill();
        if (st2) st2.kill();
        if (t2) t2.kill();
      });
    });
  };

  const setupMobile = () => {
    killBehind(); // 혹시 데스크탑 상태였다면 정리
    addPanelRevealVertical();
    ScrollTrigger.refresh();
  };

  const setupDesktop = () => {
    killBehind(); // 혹시 모바일 상태였다면 정리

    const getMaxX = () => {
      const safety = 100;
      return Math.max(
        0,
        Math.ceil(track.scrollWidth - viewport.clientWidth + safety),
      );
    };

    moveTween = gsap.to(track, {
      x: () => -getMaxX(),
      ease: "none",
      paused: true,
    });

    pinST = ScrollTrigger.create({
      id: "behind-pin",
      trigger: section,
      start: "top top",
      end: () => "+=" + (getMaxX() + window.innerHeight * 0.8),
      pin: true,
      pinSpacing: true,
      scrub: 1,
      animation: moveTween,
      invalidateOnRefresh: true,
    });

    addPanelRevealHorizontal();

    // ✅ 이미지 로드 후 refresh (마지막 카드 잘림 방지)
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

    waitImages().then(() => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  };

  const init = () => {
    if (mqMobile.matches) setupMobile();
    else setupDesktop();
  };

  init();

  // ✅ 뷰포트 변경(500px 경계)에서만 갈아끼우기
  mqMobile.addEventListener("change", init);

  // ✅ 같은 모드 내 리사이즈는 refresh만 (성능)
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
const recruitMqMobile = window.matchMedia("(max-width: 500px)");

function onScroll() {
  if (!section || !clouds) return;
  const vh = window.innerHeight;
  const sRect = section.getBoundingClientRect();

  const total = section.offsetHeight - vh; // 진행 가능 스크롤
  const passed = Math.min(Math.max(-sRect.top, 0), total);
  const progress = total > 0 ? passed / total : 0; // 0~1

  const triggerAt = recruitMqMobile.matches ? 0 : 0.75;
  if (progress >= triggerAt) {
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

// section. WORKS (동적 shots + 슬라이드 전환 + pin)
// section. WORKS (동적 shots + 슬라이드 전환 + pin) — ✅ 최종 안정본
// section. WORKS (동적 shots + 슬라이드 전환 + pin) — ✅ XY 안 무너지는 최종 JS
// section. WORKS (동적 shots + 슬라이드 전환 + pin) — ✅ 로딩/디코딩 대기까지 포함 최종 안정본
document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const slides = [
    {
      kicker: `<span class="works-kicker-bold">핵심 역량 01</span> - 문제 정의와 해결`,
      title: "PROBLEM<br />SOLVING",
      summary:
        "원밀리언 댄스 스튜디오 사이트를 구매 전환 중심 구조로 리뉴얼한 프로젝트입니다. 사용자 흐름을 재정의해 수강권 구매까지 자연스럽게 연결했습니다.",
      lesson:
        "리뉴얼 프로젝트를 진행하며, 단순히 화면을 개선하는 것이 아니라, 사용자의 목표와 서비스의 목적을 연결하는 구조 설계가 중요하다는 것을 배웠습니다.",
      workHighlight:
        "'총괄 팀장'으로서 기획 단계에서</br> 문제 정의와 해결 방법을 정하고, 그걸 토대로 디자인을 했습니다. 전반적인 기획서의 내용를 정리 및 설계했습니다.",
      workDetails: [
        "A. 메인 페이지 / 클래스 탐색 구조 개선, 팝업 클래스 안내 설계, 마퀴 섹션 디자인",
        "B. 메인 페이지 / 댄서·프로젝트·하이라이트 섹션 UI 리디자인",
        "C. 서브 페이지 / 티켓·사용법·FAQ 화면 설계 및 UI 디자인 및 개발",
        "D. 반응형 설계 / 메인 및 서브 페이지 반응형 구조 설계 및 구현",
      ],
      shots: [
        { src: "./img/p1-1.png", x: -225, y: -50, z: 2, r: 0, w: "120%" },
        { src: "./img/p1-2.png", x: -115, y: 65, z: 1, r: 0, w: "120%" },
        { src: "./img/p1-3.png", x: 35, y: 71, z: 0, r: 0, w: "120%" },
      ],
      buttons: [
        {
          label: "사이트 바로가기",
          url: "https://yunjioh.github.io/1million/",
        },
        {
          label: "기획서 보기",
          url: "https://www.figma.com/proto/rSCKNnOJKIZzwlsYK3wliR/Untitled?node-id=1-354&t=AqNuYRu6L8L4h4eF-1",
        },
      ],
      contrib: [
        { label: "기획", value: 90 },
        { label: "디자인", value: 80 },
        { label: "개발", value: 70 },
      ],
    },
    {
      kicker: `<span class="works-kicker-bold">핵심 역량 02</span> - UXUI 디자인`,
      title: "UXUI<br />DESIGN",
      summary:
        "버츄얼 아이돌과 팬을 연결하는 팬덤 앱으로, 사용자 상태(state) 기반 UX 구조를 설계한 프로젝트입니다. 디자인과 개발을 분리하지 않고 React 구현을 전제로 설계했습니다.",
      lesson:
        "디자인은 단순히 화면을 만드는 일이 아니라, 상태 변화와 동작 방식을 설계하는 일이라는 것을 배웠습니다. 컴포넌트 구조와 상태 흐름을 이해하며 개발과 연결되는 UX 사고를 기를 수 있었습니다.",
      workHighlight:
        "'총괄 팀장'으로서 디자인과 개발을 함께 고려하며, UX 구조 설계부터 구현까지 참여했습니다.",
      workDetails: [
        "A. 메인·샵 페이지 / 앨범·뮤비 상세 페이지 설계 및 개발",
        "B. Dm페이지 + 메인·샵 배너 UI 디자인",
        "C. 온보딩 및 아티스트 팔로잉 페이지 서브 디자인",
        "C. 사용자 상태(User State) 설계 : 닉네임 저장, 팔로잉 아티스트 저장 상태 반영",
      ],
      shots: [
        { src: "./img/p0-1.png", x: 0, y: 15, z: 3, r: 0, w: "55%" },
        { src: "./img/p0-2.png", x: -140, y: -90, z: 2, r: 0, w: "55%" },
        { src: "./img/p0-3.png", x: 280, y: -45, z: 1, r: 0, w: "55%" },
        { src: "./img/p0-4.png", x: 140, y: -240, z: 0, r: 0, w: "55%" },
      ],
      buttons: [
        {
          label: "사이트 바로가기",
          url: "https://tubi-nova.vercel.app/",
        },
        {
          label: "기획서 보기",
          url: "https://www.figma.com/proto/2LQV5mTCJR3TJkbFYBAiJt/NOVA-UX-CASE-STUDY?node-id=0-1&t=HJK62TiqWVzmsKVM-1",
        },
      ],
      contrib: [
        { label: "기획", value: 80 },
        { label: "디자인", value: 70 },
        { label: "개발", value: 90 },
      ],
    },
    {
      kicker: `<span class="works-kicker-bold">핵심 역량 03</span> - 새로운 아이디어`,
      title: "NEW IDEAS",
      summary:
        "반려동물 앱이 주로 강아지·고양이에 집중된 시장에서, 비주류 반려동물인 크레스티드 게코 집사들을 위한 앱으로, 먹이 주기·급여량을 계산하고 알림으로 관리 부담을 줄이는 프로젝트입니다. 익숙한 카테고리 안에서도 새로운 사용자와 문제를 발견하는 데 집중했습니다.",
      lesson:
        "사용자에게 필요한 건 “많은 정보”가 아니라 지금 당장 해야 할 행동을 명확히 알려주는 구조라는 걸 배웠습니다. 또한 상태(등록 개체/최근 기록/알림 설정)가 누적될수록 UX가 복잡해질 수 있어, 이를 단순하게 유지하는 정보 설계의 중요성을 체감했습니다.",
      workHighlight:
        "'개인 프로젝트'로 기획부터 UX 전략 수립, UI 디자인까지 전반을 담당했습니다.",
      workDetails: [
        "A. 사용자 리서치 및 문제 정의 : 집사들이 겪는 관리 혼란(먹이 주기 계산, 기록 누락 등) 정리",
        "B. 정보 구조(IA) 설계 : ‘급여 알림 → 개체 관리 → 기록 확인’ 중심으로 흐름 재구성",
        "C. 메인 대시보드 UXUI 설계 : 오늘 급여 여부, 다음 급여일, 최근 기록을 한눈에 확인하도록 설계",
        "D. 인터랙션 프로토타입 제작 및 사용성 테스트",
      ],
      shots: [
        { src: "./img/p2-1.png", x: 80, y: -110, z: 4, r: 0, w: "50%" },
        { src: "./img/p2-2.png", x: -110, y: 100, z: 3, r: 0, w: "50%" },
        { src: "./img/p2-3.png", x: 80, y: -70, z: 2, r: 0, w: "50%" },
        { src: "./img/p2-4.png", x: 210, y: -70, z: 1, r: 0, w: "50%" },
        { src: "./img/p2-5.png", x: 723, y: -1149, z: 0, r: 0, w: "50%" },
      ],
      buttons: [
        {
          label: "프로토타입 보기",
          url: "https://www.figma.com/proto/XVaoNRJBsSkgmKXafQe8zy/Untitled?node-id=1-1621&t=XlV4wjqqdOqslltg-1",
        },
        {
          label: "기획서 보기",
          url: "https://www.figma.com/proto/XVaoNRJBsSkgmKXafQe8zy/CRECRE-PERSONAL-APP?node-id=1-10949&t=XlV4wjqqdOqslltg-1",
        },
      ],
      contrib: [
        { label: "기획", value: 100 },
        { label: "디자인", value: 100 },
        { label: "개발", value: 100 },
      ],
    },
  ];

  const section = document.querySelector("#works");
  if (!section) return;

  const stack = section.querySelector("[data-stack]");
  const kickerEl = section.querySelector("[data-kicker]");
  const titleEl = section.querySelector("[data-title]");
  const descEl = section.querySelector("[data-desc]");
  const actionsEl = section.querySelector("[data-actions]");
  const btn0 = section.querySelector('[data-btn="0"]');
  const btn1 = section.querySelector('[data-btn="1"]');
  const prevBtn = section.querySelector('[data-arrow="prev"]');
  const nextBtn = section.querySelector('[data-arrow="next"]');
  const contribEl = section.querySelector("[data-contrib]");

  let index = 0;
  let isAnimating = false;
  let activeTween = null;

  const stripTags = (html) => String(html).replace(/<[^>]*>/g, "");
  const toCssLength = (value, fallback) => {
    if (value === undefined || value === null || value === "") return fallback;
    return typeof value === "number" ? `${value}px` : String(value);
  };
  const formatWorkDetail = (text) => {
    const withLabel = String(text).replace(
      /^([A-Z]\.\s*)?(사용자\s*상태\s*\(User\s*State\)\s*설계|온보딩\s*및\s*아티스트\s*팔로잉\s*페이지|Dm\s*페이지\s*\+\s*메인\s*[+·]\s*샵\s*배너|메인\s*[+·]\s*샵\s*페이지|메인\s*\+\s*서브\s*페이지|메인\s*페이지|서브\s*페이지|전체\s*페이지|반응형\s*설계|사용자\s*리서치\s*및\s*문제\s*정의|정보\s*구조\s*\(IA\)\s*설계|메인\s*대시보드\s*UXUI\s*설계|인터랙션\s*프로토타입\s*제작)\s*(\/|:)?\s*/,
      (_m, prefix = "", label, separator) => {
        const sep = separator === ":" ? " : " : separator === "/" ? " / " : " ";
        return `<span class="works-work-label">${prefix}${label}</span>${sep}`;
      },
    );

    return withLabel.replace(
      /반응형\s*설계/g,
      (match) => `<span class="works-work-highlight">${match}</span>`,
    );
  };
  const formatWorkHighlight = (text) =>
    String(text).replace(
      /'총괄 팀장'|총괄 팀장|'개인 프로젝트'|개인 프로젝트/g,
      (match) => `<span class="works-work-highlight">${match}</span>`,
    );
  const formatOverviewText = (text) =>
    String(text).replace(
      /수강권\s*구매까지\s*자연스럽게\s*연결|사용자의\s*목표와\s*서비스의\s*목적|연결하는\s*구조\s*설계|사용자\s*상태\s*\(state\)\s*기반\s*UX\s*구조|개발과\s*연결되는\s*UX\s*사고|새로운\s*사용자와\s*문제를\s*발견|해야\s*할\s*행동을\s*명확히\s*알려주는\s*구조/g,
      (match) => `<span class="works-work-highlight">${match}</span>`,
    );

  const renderMobileList = () => {
    const inner = section.querySelector(".works-inner");
    if (!inner) return;

    inner.classList.add("works-inner--list");
    inner.innerHTML = slides
      .map((s, i) => {
        const shots = s.shots || [];
        const shotsHtml = shots
          .map(
            (shot, shotIndex) => `
              <img
                src="${shot.src}"
                alt="${stripTags(s.kicker)} 이미지 ${shotIndex + 1}"
                class="${i === 2 && shotIndex === 0 ? "is-hidden" : ""}"
                style="
                  --shot-w:${toCssLength(shot.w, "100%")};
                  --shot-max-h:${toCssLength(shot.maxH, "none")};
                  --shot-x:${toCssLength(shot.offsetX ?? shot.x, "0px")};
                  --shot-y:${toCssLength(shot.offsetY ?? shot.y, "0px")};
                "
              />
            `,
          )
          .join("");
        const buttons = (s.buttons || [])
          .map(
            (b) => `
              <a
                class="works-btn"
                href="${b.url}"
                target="_blank"
                rel="noreferrer"
              >
                ${b.label}
              </a>
            `,
          )
          .join("");

        const contrib = (s.contrib || [])
          .map(
            (it) => `
              <div class="contrib-row">
                <span class="contrib-label">${it.label}</span>
                <div class="contrib-track" aria-hidden="true">
                  <div class="contrib-fill" style="width:${it.value}%"></div>
                </div>
                <span class="contrib-value">${it.value}%</span>
              </div>
            `,
          )
          .join("");

        return `
          <article class="works-item" data-works-item="${i}">
            ${
              shotsHtml
                ? `<div class="works-item-media${
                    i === 0 || i === 1 || i === 2
                      ? " works-item-media--grid"
                      : ""
                  }">
                    ${shotsHtml}
                  </div>`
                : ""
            }
            <div class="works-item-body">
              <p class="works-kicker">${s.kicker}</p>
              <h3 class="works-title">${s.title}</h3>
              <div class="works-overview">
                <div class="works-overview-col">
                  <h4 class="works-subtitle">간략 소개</h4>
                  <p class="works-copy">${formatOverviewText(s.summary || "")}</p>
                </div>
                <div class="works-overview-col">
                  <h4 class="works-subtitle">배운 점</h4>
                  <p class="works-copy">${formatOverviewText(s.lesson || "")}</p>
                </div>
              </div>
              <div class="works-workpart">
                <h4 class="works-subtitle">작업한 부분</h4>
                ${
                  s.workHighlight
                    ? `<p class="works-copy">${formatWorkHighlight(s.workHighlight)}</p>`
                    : ""
                }
                ${
                  (s.workDetails || []).length
                    ? `<ol class="works-work-list">
                        ${(s.workDetails || [])
                          .map((item) => `<li>${formatWorkDetail(item)}</li>`)
                          .join("")}
                      </ol>`
                    : ""
                }
              </div>
              ${
                contrib || buttons
                  ? `<div class="works-meta-row">
                      ${
                        contrib
                          ? `<div class="works-contrib" aria-label="기여도">${contrib}</div>`
                          : ""
                      }
                      ${
                        buttons
                          ? `<div class="works-actions works-actions--vertical">${buttons}</div>`
                          : ""
                      }
                    </div>`
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");
  };

  renderMobileList();
  return;

  // ✅ 이미지 로딩/디코딩 캐시 (전환 때 튀는 원인 제거)
  const imgCache = new Map();
  const ensureImageReady = (src) => {
    if (!src) return Promise.resolve();
    if (imgCache.has(src)) return imgCache.get(src);

    const p = new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve();
      im.onerror = () => resolve(); // 에러여도 전환이 멈추면 UX가 더 나빠서 resolve
      im.src = src;

      // decode 지원 브라우저면 decode까지 기다리면 더 안정적
      if (im.decode) {
        im.decode()
          .then(resolve)
          .catch(() => resolve());
      }
    });

    imgCache.set(src, p);
    return p;
  };

  const ensureSlideImagesReady = (slideIndex) => {
    const s = slides[slideIndex];
    const srcs = (s?.shots || []).map((x) => x.src);
    return Promise.all(srcs.map(ensureImageReady));
  };

  // ✅ shots DOM 생성 (works-shot은 위치 고정 / inner만 애니메이션)
  const renderShots = (shots = [], kickerTextForAlt = "") => {
    stack.innerHTML = shots
      .map(
        (s, i) => `
          <div class="works-shot"
            style="
              --x:${s.x ?? 50}%;
              --y:${s.y ?? 50}%;
              --z:${s.z ?? i};
              --r:${s.r ?? 0}deg;
            "
          >
            <div class="works-shot-inner">
              <img src="${s.src}" alt="${kickerTextForAlt} 이미지 ${i + 1}" />
            </div>
          </div>
        `,
      )
      .join("");
  };

  const renderContrib = (items = []) => {
    if (!contribEl) return;

    contribEl.innerHTML = (items || [])
      .map(
        (it) => `
        <div class="contrib-row">
          <span class="contrib-label">${it.label}</span>
          <div class="contrib-track" aria-hidden="true">
            <div class="contrib-fill" data-fill style="--v:${it.value}"></div>
          </div>
          <span class="contrib-value">${it.value}%</span>
        </div>
      `,
      )
      .join("");

    // ✅ 바 애니메이션 (0 -> 목표치)
    const fills = Array.from(contribEl.querySelectorAll("[data-fill]"));
    gsap.set(fills, { width: "0%" });
    gsap.to(fills, {
      width: (i, el) => `${Number(el.style.getPropertyValue("--v")) || 0}%`,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.06,
    });
  };

  const applySlide = (i) => {
    const s = slides[i];
    kickerEl.innerHTML = s.kicker;
    titleEl.innerHTML = s.title;
    descEl.innerHTML = s.desc;

    renderShots(s.shots, stripTags(s.kicker));
    renderContrib(s.contrib || []);

    if (s.buttons?.[0]) {
      btn0.textContent = s.buttons[0].label;
      btn0.href = s.buttons[0].url;
      btn0.style.display = "inline-flex";
    } else {
      btn0.style.display = "none";
    }

    if (s.buttons?.[1]) {
      btn1.textContent = s.buttons[1].label;
      btn1.href = s.buttons[1].url;
      btn1.style.display = "inline-flex";
    } else {
      btn1.style.display = "none";
    }
  };

  const getShotInners = () =>
    Array.from(stack.querySelectorAll(".works-shot-inner"));

  // ✅ 초기 렌더 전: 0번 슬라이드 이미지 미리 준비
  ensureSlideImagesReady(0).finally(() => {
    applySlide(0);
  });

  const go = (dir) => {
    if (isAnimating) return;
    isAnimating = true;

    const nextIndex = (index + dir + slides.length) % slides.length;

    const outX = dir === 1 ? -60 : 60;
    const inX = dir === 1 ? 60 : -60;

    const targets = [stack, kickerEl, titleEl, descEl, actionsEl, contribEl];
    const currentInners = getShotInners();

    if (activeTween) activeTween.kill();
    gsap.killTweensOf([...targets, ...currentInners]);

    // 1) OUT
    activeTween = gsap.to([...targets, ...currentInners], {
      x: outX,
      opacity: 0,
      duration: 0.28,
      ease: "power2.out",
      onComplete: async () => {
        // ✅ 핵심: 다음 슬라이드 이미지가 준비될 때까지 기다렸다가 교체/IN
        await ensureSlideImagesReady(nextIndex);

        // 2) 교체
        applySlide(nextIndex);

        const nextInners = getShotInners();

        // 텍스트만 clearProps (shots에는 절대 clearProps 금지)
        gsap.set(targets, { clearProps: "transform,opacity" });

        // IN 시작 상태
        gsap.set(targets, { x: inX, opacity: 0 });
        gsap.set(nextInners, { x: inX, opacity: 0 });

        // 3) IN (텍스트)
        gsap.to(targets, {
          x: 0,
          opacity: 1,
          duration: 0.34,
          ease: "power2.out",
        });

        // 3-1) IN (shots)
        gsap.to(nextInners, {
          x: 0,
          opacity: 1,
          duration: 0.38,
          ease: "power2.out",
          stagger: 0.05,
          onComplete: () => {
            index = nextIndex;
            isAnimating = false;
            activeTween = null;
          },
        });
      },
    });
  };

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  section.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  ScrollTrigger.create({
    trigger: "#works",
    start: "top top",
    end: "+=60%",
    pin: true,
    pinSpacing: true,
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // ✅ STICKY(service) 끝난 뒤부터 body 배경 변경
  ScrollTrigger.create({
    trigger: "#service", // 🔁 hero → sticky 섹션
    start: "bottom bottom", // 🔑 sticky가 끝나는 순간
    end: "bottom bottom",
    onEnter: () =>
      gsap.to(document.body, {
        backgroundColor: "#ffffff",
        duration: 0.4,
        overwrite: "auto",
      }),
    onEnterBack: () =>
      gsap.to(document.body, {
        backgroundColor: "#336bec",
        duration: 0.4,
        overwrite: "auto",
      }),
    // markers: true,
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (!window.Swiper) return;

  const swiper = new Swiper(".clone-swiper", {
    centeredSlides: true,
    centeredSlidesBounds: true,
    spaceBetween: 25,
    speed: 500,
    slidesPerGroup: 1, // ✅ 항상 1장씩 이동
    slidesPerGroupSkip: 0,
    threshold: 10, // ✅ 살짝 드래그해야 넘어가게(한장 느낌 강화)
    longSwipesRatio: 0.15, // ✅ 길게 쓸면 더 잘 넘어감
    longSwipesMs: 200,
    shortSwipes: true,

    // ✅ 한 번에 딱 스냅되게
    // (freeMode 쓰면 한장 느낌 사라짐 -> false 유지)
    freeMode: false,

    // initialSlide는 centeredSlides일 때 "중앙에 올 카드"로 쓰기 좋음
    initialSlide: 2,

    breakpoints: {
      0: { slidesPerView: 1.05 },
      480: { slidesPerView: 1.25 },
      768: { slidesPerView: 2.1 },
      1100: { slidesPerView: 3.1 },
      1440: { slidesPerView: 4.1 },
    },
  });
});
// ✅ 커스텀 커서 (hover 시 보이고, 마우스 따라다님)
const cursor = document.querySelector(".clone-cursor");
const area = document.querySelector(".clone");
const cards = area.querySelectorAll(".clone-card");

const showCursor = () => cursor.classList.add("is-active");
const hideCursor = () => cursor.classList.remove("is-active");

area.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

cards.forEach((card) => {
  card.addEventListener("mouseenter", showCursor);
  card.addEventListener("mouseleave", hideCursor);

  card.addEventListener("click", () => {
    const url = card.dataset.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  });
});

// section.SKILL
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(max-width: 500px)").matches) return;
  const marquee = document.querySelector(".skills-marquee");
  const track = marquee?.querySelector("[data-track]");
  if (!marquee || !track) return;

  let isDown = false;
  let startX = 0;
  let lastX = 0;

  // 현재 transformX 읽기
  const getX = () => {
    const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
    return m.m41; // translateX
  };

  // ✅ track의 실제 px 너비(= 1세트 + 1세트)
  // 우리가 2세트를 넣었으므로, "반"이 1세트 폭
  const getHalfWidth = () => {
    // track의 전체 scrollWidth는 2세트 폭
    return track.scrollWidth / 2;
  };

  // ✅ 무한처럼 보이게 wrap
  const wrapX = (x) => {
    const half = getHalfWidth();
    // x가 너무 왼쪽/오른쪽으로 가면 half만큼 되돌려서 끊김 방지
    if (x <= -half) x += half;
    if (x >= 0) x -= half;
    return x;
  };

  const setX = (x) => {
    track.style.transform = `translateX(${wrapX(x)}px)`;
  };

  const onDown = (e) => {
    isDown = true;
    track.classList.add("is-paused");

    // CSS 애니메이션 중이었으면, 현재 위치를 transform으로 고정
    const cur = getX();
    track.style.animation = "none";
    track.style.transform = `translateX(${cur}px)`;

    startX = e.clientX;
    lastX = cur;
  };

  const onMove = (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    setX(lastX + dx);
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;

    // 드래그 끝 위치를 기준으로 다시 자동으로 흐르게
    const cur = getX();
    track.style.transform = `translateX(${wrapX(cur)}px)`;

    // ✅ 애니메이션 재개: transform 유지하면서 이어가려면
    // CSS 애니메이션은 transform을 덮어쓰므로,
    // "현재 위치에서 시작"하려면 CSS 변수 방식이 필요함.
    // 간단히: 놓으면 자연스럽게 다시 처음부터 흐르도록 재시작
    track.style.animation = "";
    track.classList.remove("is-paused");
    track.style.transform = ""; // CSS animation이 다시 담당
  };

  // 마우스
  marquee.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  // 터치
  marquee.addEventListener("touchstart", (e) => onDown(e.touches[0]), {
    passive: true,
  });
  window.addEventListener("touchmove", (e) => onMove(e.touches[0]), {
    passive: true,
  });
  window.addEventListener("touchend", onUp);
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(max-width: 500px)").matches) return;
  const cursor = document.querySelector(".skills-cursor");
  const area = document.querySelector(".skills-marquee"); // ✅ 마퀴 영역
  if (!cursor || !area) return;

  const showCursor = () => cursor.classList.add("is-active");
  const hideCursor = () => cursor.classList.remove("is-active");

  // ✅ 영역 들어오면 보이기 / 나가면 숨기기
  area.addEventListener("mouseenter", showCursor);
  area.addEventListener("mouseleave", hideCursor);

  // ✅ 마우스 위치 따라가기
  area.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const topBtn = document.querySelector(".top-btn");
  if (!topBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) topBtn.classList.add("is-show");
    else topBtn.classList.remove("is-show");
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
