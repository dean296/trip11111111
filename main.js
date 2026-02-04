/*
  React(App.tsx) -> HTML/CSS/jQuery 포팅본
  - UI는 원본이 Tailwind 유틸리티 기반이라 Tailwind CDN을 유지했습니다.
  - 동작(모달/갤러리/타이머/인원/날짜 선택)은 jQuery로 재구현했습니다.
*/

(function ($) {
  // -----------------------------
  // Data (App.tsx에서 가져온 데이터)
  // -----------------------------
  const mainImages = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop"
  ];

  const roomD = {
    name: "D",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f715?q=80&w=800&auto=format&fit=crop"
    ],
    minGuests: 2,
    maxGuests: 4,
    description:
      "태안 엘플레이트풀빌라의 시그니처 객실인 D룸은 넓은 개별 온수풀과 프라이빗한 바베큐 공간을 제공합니다.\n\n최고급 킹 사이즈 매트리스와 구스 침구로 편안한 휴식을 보장하며, 통창을 통해 들어오는 채광이 아름다운 객실입니다."
  };

  const allFacilities = [
    { icon: "layers", name: "복층" },
    { icon: "home", name: "독채" },
    { icon: "paw-print", name: "애견" },
    { icon: "utensils", name: "개별바베큐" },
    { icon: "waves", name: "온수풀" },
    { icon: "camera", name: "오션뷰" },
    { icon: "zap", name: "무료와이파이" },
    { icon: "clock", name: "24시간보안" },
    { icon: "users-2", name: "공용시설" },
    { icon: "gift", name: "어메니티제공" }
  ];

  const attractions = [
    { name: "속초문화원", distance: "1.18km" },
    { name: "속초문화예술회관 소강당", distance: "1.21km" },
    { name: "속초문화예술회관", distance: "1.22km" },
    { name: "스페이스 동원냉동", distance: "2.48km" },
    { name: "아트플랫폼갯배", distance: "2.58km" },
    { name: "석봉도자기미술관", distance: "2.90km" },
    { name: "소극장&음악창작소 초속", distance: "3.03km" },
    { name: "강원국제관광 엑스포기념관", distance: "3.59km" },
    { name: "피노디아 다빈치뮤지엄", distance: "3.66km" },
    { name: "피노디아 미켈란젤로뮤지엄", distance: "3.68km" },
    { name: "피노디아 테마파크", distance: "3.69km" },
    { name: "메가박스 속초", distance: "3.84km" },
    { name: "풀묶음미술관", distance: "3.95km" },
    { name: "국립산악박물관", distance: "4.85km" },
    { name: "뮤지엄엑스", distance: "0.58km" }
  ];

  // Gallery store (DOM data-gallery로 접근)
  const galleries = {
    main: mainImages,
    roomD: roomD.images
  };

  // -----------------------------
  // State
  // -----------------------------
  let startDate = normalizeDate(new Date());
  let endDate = normalizeDate(new Date(Date.now() + 86400000));
  let adults = 2;
  let children = 0;
  let infants = 0;

  let secondsRemaining = 24 * 60 * 60;

  let currentGallery = "main";
  let galleryActiveIndex = 0;

  let selectedPayment = "card";

  // -----------------------------
  // Utils
  // -----------------------------
  function normalizeDate(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function formatDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}.${dd}`;
  }

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function nights() {
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  }

  function totalGuests() {
    return adults + children + infants;
  }

  function anyModalOpen() {
    return $(".modal-overlay.is-open").length > 0;
  }

  function updateChrome() {
    if (anyModalOpen()) {
      $("body").addClass("no-scroll");
      $("#promoHeader").addClass("-translate-y-full").removeClass("translate-y-0 shadow-xl");
      $("#chatFab").hide();
    } else {
      $("body").removeClass("no-scroll");
      $("#promoHeader").removeClass("-translate-y-full").addClass("translate-y-0 shadow-xl");
      $("#chatFab").show();
    }
  }

  function toast(msg) {
    // 심플 alert (원하면 토스트 UI로 교체 가능)
    alert(msg);
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  function renderMosaic($root, galleryKey, images) {
    const totalCount = images.length;
    const safe = images.slice(0, 5);

    const imgTag = (src, idx) =>
      `<img data-gallery="${galleryKey}" data-index="${idx}" src="${src}" alt="${galleryKey}-${idx}" class="w-full h-full object-cover hover:opacity-80 transition-opacity" />`;

    const extra = totalCount > 5 ? `<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold backdrop-blur-[1px]">+${totalCount - 5}</div>` : "";

    const html = `
      <div class="relative w-full aspect-[4/3] flex gap-1 bg-white overflow-hidden cursor-pointer group">
        <div class="w-1/2 h-full">${imgTag(safe[0], 0)}</div>
        <div class="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-1">
          <div>${imgTag(safe[1], 1)}</div>
          <div>${imgTag(safe[2], 2)}</div>
          <div>${imgTag(safe[3], 3)}</div>
          <div class="relative">${imgTag(safe[4], 4)}${extra}</div>
        </div>
      </div>
    `;

    $root.html(html);

    // 이미지 에러 fallback
    $root.find("img").on("error", function () {
      $(this).attr("src", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800");
    });
  }

  function renderFacilities() {
    const first4 = allFacilities.slice(0, 4);
    // 메인 화면 미리보기(최대 4개)
    // HTML: <div id="facilitiesPreview" ...>
    const $grid = $("#facilitiesPreview");
    $grid.empty();

    first4.forEach((it) => {
      $grid.append(`
        <div class="flex items-center gap-4">
          <div class="text-gray-400"><i data-lucide="${it.icon}" style="width:28px;height:28px"></i></div>
          <span class="text-[15px] font-bold text-gray-700">${it.name}</span>
        </div>
      `);
    });

    const $all = $("#facilitiesAll");
    $all.empty();
    allFacilities.forEach((it) => {
      $all.append(`
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div class="text-gray-500"><i data-lucide="${it.icon}" style="width:18px;height:18px"></i></div>
          <div class="font-bold text-gray-800">${it.name}</div>
        </div>
      `);
    });

    refreshIcons();
    // HTML: <span id="facilityCount">0</span>
    $("#facilityCount").text(allFacilities.length);
  }

  function renderAttractions() {
    const $preview = $("#attractionsPreview");
    $preview.empty();

    attractions.slice(0, 3).forEach((it) => {
      $preview.append(`
        <div class="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
          <div class="flex items-center gap-2.5 truncate">
            <div class="p-1.5 bg-blue-50 rounded-md text-blue-500 shrink-0"><i data-lucide="map-pin" style="width:12px;height:12px"></i></div>
            <span class="text-[13px] font-bold text-gray-800 truncate">${it.name}</span>
          </div>
          <span class="text-[11px] font-black text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded shrink-0 ml-2">${it.distance}</span>
        </div>
      `);
    });

    const $all = $("#attractionsAll");
    $all.empty();
    attractions.forEach((it) => {
      $all.append(`
        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div class="flex items-center gap-2 truncate">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0"><i data-lucide="map-pin" style="width:14px;height:14px"></i></div>
            <div class="truncate">
              <div class="text-[14px] font-bold text-gray-900 truncate">${it.name}</div>
              <div class="text-[12px] text-gray-500 font-medium">숙소 기준 거리</div>
            </div>
          </div>
          <div class="text-[12px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${it.distance}</div>
        </div>
      `);
    });

    refreshIcons();
  }

  function renderRoomCard() {
    renderMosaic($("#roomMosaic"), "roomD", roomD.images);

    $("#roomName").text(roomD.name);
    $("#roomGuests").text(`기준 ${roomD.minGuests}인 / 최대 ${roomD.maxGuests}인`);
    $("#roomDesc").text(roomD.description.split("\n\n")[0]);
  }

  function renderState() {
    // timer
    $("#promoTimer").text(formatTime(secondsRemaining));

    // schedule button
    const nightsText = nights();
    // 메인 화면(객실 선택 > 일정 및 인원) 요약 텍스트
    $("#scheduleSummary").text(`${formatDate(startDate)} ~ ${formatDate(endDate)} (${nightsText}박) / ${totalGuests()}명`);

    // booking modal inputs
    $("#startDate").val(toISODate(startDate));
    $("#endDate").val(toISODate(endDate));
    $("#countAdults").text(adults);
    $("#countChildren").text(children);
    $("#countInfants").text(infants);
    $("#bookingSummaryDates").text(`${formatDate(startDate)} ~ ${formatDate(endDate)} (${nightsText}박)`);
    $("#bookingSummaryGuests").text(`${totalGuests()}명`);

    // reservation view summary
    $("#rvDates").text(`${formatDate(startDate)} ~ ${formatDate(endDate)} (${nightsText}박)`);
    $("#rvGuests").text(`${totalGuests()}명 (성인 ${adults}, 아동 ${children}, 유아 ${infants})`);
    $("#rvTimer").text(formatTime(secondsRemaining));

    // bottom bar
    $("#bottomDates").text(`${formatDate(startDate)} ~ ${formatDate(endDate)} (${nightsText}박)`);
    $("#bottomGuests").text(`${totalGuests()}명`);

    // payment selection
    $(".js-pay").removeClass("ring-2 ring-blue-600");
    $(`.js-pay[data-pay='${selectedPayment}']`).addClass("ring-2 ring-blue-600");
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // -----------------------------
  // Modals
  // -----------------------------
  function openModal(sel) {
    $(sel).addClass("is-open");
    updateChrome();
  }

  function closeModal(sel) {
    $(sel).removeClass("is-open");
    updateChrome();
  }

  // -----------------------------
  // Gallery
  // -----------------------------
  function openGallery(galleryKey, index) {
    currentGallery = galleryKey;
    galleryActiveIndex = index;
    renderGallery();
    openModal("#galleryModal");
  }

  function renderGallery() {
    const imgs = galleries[currentGallery] || [];
    if (!imgs.length) return;

    galleryActiveIndex = ((galleryActiveIndex % imgs.length) + imgs.length) % imgs.length;

    $("#galleryImage").attr("src", imgs[galleryActiveIndex]);
    $("#galleryCounter").text(`${galleryActiveIndex + 1} / ${imgs.length}`);

    const $thumbs = $("#galleryThumbs");
    $thumbs.empty();

    imgs.forEach((src, i) => {
      const isActive = i === galleryActiveIndex;
      $thumbs.append(`
        <button class="shrink-0 rounded-xl overflow-hidden border ${isActive ? "border-blue-600" : "border-gray-200"}" data-idx="${i}" aria-label="thumb ${i + 1}">
          <img src="${src}" alt="thumb-${i}" class="w-16 h-12 object-cover" />
        </button>
      `);
    });

    // thumb click
    $thumbs.find("button").off("click").on("click", function () {
      galleryActiveIndex = parseInt($(this).attr("data-idx"), 10);
      renderGallery();
    });

    // error fallback
    $("#galleryImage").off("error").on("error", function () {
      $(this).attr("src", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800");
    });
  }

  // -----------------------------
  // Timer (24h)
  // -----------------------------
  function initTimer() {
    const key = "villa_promo_start_time";
    let startTime = localStorage.getItem(key);
    if (!startTime) {
      startTime = String(Date.now());
      localStorage.setItem(key, startTime);
    }

    function tick() {
      const now = Date.now();
      const elapsed = Math.floor((now - parseInt(startTime, 10)) / 1000);
      secondsRemaining = Math.max(0, 24 * 60 * 60 - elapsed);
      renderState();
    }

    tick();
    setInterval(tick, 1000);
  }

  // -----------------------------
  // Events
  // -----------------------------
  function bindEvents() {
    // open booking modal
    $("#openBooking").on("click", function () {
      openModal("#bookingModal");
    });

    // close modal buttons
    $(document).on("click", ".js-close-modal", function () {
      const target = $(this).data("target");
      closeModal(target);

      // review iframe 정리
      if (target === "#reviewModal") {
        $("#reviewFrame").attr("src", "about:blank");
      }
    });

    // overlay click: close (시트 바깥 클릭)
    $(document).on("click", ".modal-overlay", function (e) {
      if (e.target === this) {
        closeModal("#" + $(this).attr("id"));
        if ($(this).attr("id") === "reviewModal") $("#reviewFrame").attr("src", "about:blank");
      }
    });

    // counter
    $(document).on("click", ".js-counter", function () {
      const field = $(this).data("field");
      const delta = parseInt($(this).data("delta"), 10);
      if (field === "adults") adults = Math.max(1, adults + delta);
      if (field === "children") children = Math.max(0, children + delta);
      if (field === "infants") infants = Math.max(0, infants + delta);
      renderState();
    });

    // date inputs
    $("#startDate").on("change", function () {
      const d = normalizeDate(new Date($(this).val()));
      startDate = d;
      if (endDate.getTime() <= startDate.getTime()) {
        endDate = normalizeDate(new Date(startDate.getTime() + 86400000));
      }
      renderState();
    });

    $("#endDate").on("change", function () {
      const d = normalizeDate(new Date($(this).val()));
      if (d.getTime() <= startDate.getTime()) {
        toast("체크아웃은 체크인 이후 날짜여야 합니다.");
        endDate = normalizeDate(new Date(startDate.getTime() + 86400000));
      } else {
        endDate = d;
      }
      renderState();
    });

    // apply booking
    $("#bookingApply").on("click", function () {
      closeModal("#bookingModal");
      renderState();
    });

    // open gallery from mosaic images
    $(document).on("click", "img[data-gallery][data-index]", function (e) {
      e.preventDefault();
      const galleryKey = $(this).attr("data-gallery");
      const index = parseInt($(this).attr("data-index"), 10);
      openGallery(galleryKey, index);
    });

    // gallery controls
    $("#galleryPrev").on("click", function () {
      galleryActiveIndex -= 1;
      renderGallery();
    });
    $("#galleryNext").on("click", function () {
      galleryActiveIndex += 1;
      renderGallery();
    });

    // open facilities
    $("#openFacilities").on("click", function () {
      openModal("#facilitiesModal");
    });

    // open attractions
    $("#openAttractions").on("click", function () {
      openModal("#attractionsModal");
    });

    // open review frame
    $(".js-open-review").on("click", function () {
      const url = $(this).data("url");
      $("#reviewFrame").attr("src", url);
      openModal("#reviewModal");
    });

    // room modal
    $("#openRoomInfo").on("click", function () {
      openModal("#roomModal");
    });

    // reserve (room card)
    $("#openReservation").on("click", function () {
      openModal("#reservationModal");
    });

    // reserve (room modal)
    $("#roomReserve").on("click", function () {
      closeModal("#roomModal");
      openModal("#reservationModal");
    });

    // payment selection
    $(document).on("click", ".js-pay", function () {
      selectedPayment = $(this).data("pay");
      renderState();
    });

    // pay button
    $("#payNow").on("click", function () {
      toast(`(데모) 결제 진행: ${selectedPayment}`);
    });

    // copy address
    $("#copyAddress").on("click", async function () {
      const addr = "충청남도 태안군 남면 몽대로 359-3";
      try {
        await navigator.clipboard.writeText(addr);
        toast("주소 복사됨");
      } catch {
        // fallback
        const $tmp = $("<textarea>").val(addr).appendTo("body").select();
        document.execCommand("copy");
        $tmp.remove();
        toast("주소 복사됨");
      }
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  $(function () {
    // initial render
    renderMosaic($("#mainMosaic"), "main", mainImages);
    renderFacilities();
    renderAttractions();
    renderRoomCard();

    // fill room modal
    $("#roomModalTitle").text(`${roomD.name} 객실`);
    $("#roomModalGuests").text(`기준 ${roomD.minGuests}인 / 최대 ${roomD.maxGuests}인`);
    $("#roomModalDesc").text(roomD.description);
    renderMosaic($("#roomModalMosaic"), "roomD", roomD.images);

    // reservation modal
    $("#rvRoomName").text(`객실 ${roomD.name}`);

    // icons
    refreshIcons();

    // events
    bindEvents();

    // state
    renderState();
    updateChrome();

    // timer
    initTimer();
  });
})(jQuery);
