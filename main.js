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
    checkIn: "15:00",
    checkOut: "11:00",
    description:
      "태안 엘플레이트풀빌라의 시그니처 객실인 D룸은 넓은 개별 온수풀과 프라이빗한 바베큐 공간을 제공합니다.\n\n최고급 킹 사이즈 매트리스와 구스 침구로 편안한 휴식을 보장하며, 통창을 통해 들어오는 채광이 아름다운 객실입니다."
  };

  // 객실 목록(라이브에서는 선택 날짜/인원에 따라 N개로 늘어날 수 있음)
  const rooms = [roomD];
  let activeRoomIndex = 0;

  function getActiveRoom() {
    return rooms[Math.max(0, Math.min(activeRoomIndex, rooms.length - 1))];
  }

  function setActiveRoom(idx) {
    activeRoomIndex = idx;
  }

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

  // room detail view
  let lastMainScrollY = 0;

  // booking modal (temp range selection)
  let bookingTempStart = startDate;
  let bookingTempEnd = endDate;
  let bookingViewMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // -----------------------------
  // Utils
  // -----------------------------
  function normalizeDate(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  // 메인 화면 요약 표기용 (예: 02.03)
  function formatDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}.${dd}`;
  }

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function fillRoomModal() {
    const room = getActiveRoom();
    if (!room) return;

    $("#roomDetailName").text(`객실 ${room.name}`);
    $("#roomDetailGuests").text(`기준 ${room.minGuests}인 / 최대 ${room.maxGuests}인`);
    const ci = room.checkIn || "15:00";
    const co = room.checkOut || "11:00";
    $("#roomDetailTimes").text(`체크인 ${ci} / 체크아웃 ${co}`);
    $("#roomDetailDesc").text(room.description || "");

    // 사진 영역: 객실사진과 동일한 모자이크
    renderMosaic($("#roomDetailMosaic"), `room_${activeRoomIndex}`, room.images);

    refreshIcons();
  }

  function formatISODate(d) {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  function formatFullDateKR(d) {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function fromISODate(iso) {
    const parts = String(iso).split("-").map((x) => parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return normalizeDate(new Date());
    return normalizeDate(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  // 예약페이지 이동/복귀에 사용할 메인 상태 저장/복원
  function saveMainReturnState(scrollYOverride) {
    try {
      const y = Number.isFinite(scrollYOverride) ? scrollYOverride : window.scrollY || 0;
      sessionStorage.setItem("mainScrollY", String(y));
      sessionStorage.setItem(
        "mainState",
        JSON.stringify({
          start: toISODate(startDate),
          end: toISODate(endDate),
          adults,
          children,
          infants,
          activeRoomIndex
        })
      );
    } catch {}
  }

  function restoreMainReturnStateIfRequested() {
    const params = new URLSearchParams(location.search);
    if (params.get("restore") !== "1") return false;

    let st = null;
    try {
      st = JSON.parse(sessionStorage.getItem("mainState") || "null");
    } catch {
      st = null;
    }
    if (!st) return true; // restore 요청은 있었으나 상태 없음

    if (st.start) startDate = fromISODate(st.start);
    if (st.end) endDate = fromISODate(st.end);
    adults = Math.max(1, parseInt(st.adults ?? adults, 10) || adults);
    children = Math.max(0, parseInt(st.children ?? children, 10) || children);
    infants = Math.max(0, parseInt(st.infants ?? infants, 10) || infants);
    if (Number.isFinite(parseInt(st.activeRoomIndex, 10))) {
      activeRoomIndex = Math.max(0, Math.min(parseInt(st.activeRoomIndex, 10), rooms.length - 1));
    }

    // booking modal temp도 동기화
    bookingTempStart = startDate;
    bookingTempEnd = endDate;
    bookingViewMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // restore 파라미터 제거(재로딩 시 반복 방지)
    try {
      params.delete("restore");
      const next = params.toString();
      history.replaceState({}, "", `${location.pathname}${next ? "?" + next : ""}${location.hash || ""}`);
    } catch {}

    return true;
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
    if (!totalCount) {
      $root.empty();
      return;
    }

    // 갤러리 저장(동적으로 생성되는 key도 열람 가능하게)
    galleries[galleryKey] = images;

    const safe = images.slice(0, 5);
    const pick = (i) => safe[i] || safe[safe.length - 1] || images[images.length - 1];

    const imgTag = (src, idx) =>
      `<img data-gallery="${galleryKey}" data-index="${idx}" src="${src}" alt="${galleryKey}-${idx}" class="w-full h-full object-cover hover:opacity-80 transition-opacity" />`;

    const extraCount = totalCount - 5;
    const extra =
      extraCount > 0
        ? `<button type="button" class="mosaic-more absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold backdrop-blur-[1px]" data-gallery="${galleryKey}" data-index="4" aria-label="사진 더보기">+${extraCount}</button>`
        : "";

    const html = `
      <div class="relative w-full aspect-[4/3] flex gap-1 bg-white overflow-hidden cursor-pointer group">
        <div class="w-1/2 h-full">${imgTag(pick(0), 0)}</div>
        <div class="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-1">
          <div>${imgTag(pick(1), 1)}</div>
          <div>${imgTag(pick(2), 2)}</div>
          <div>${imgTag(pick(3), 3)}</div>
          <div class="relative">${imgTag(pick(4), 4)}${extra}</div>
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
    // 편의시설 0개면 섹션 자체 미노출
    if (allFacilities.length === 0) {
      $("#facilitiesSection").hide();
      return;
    }
    $("#facilitiesSection").show();
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

    // 편의시설이 4개 이하인 경우: '모두보기' 버튼 미표시
    if (allFacilities.length <= 4) {
      $("#openFacilities").hide();
    } else {
      $("#openFacilities").show();
    }
  }

  function renderAttractions() {
    // 주변 관광지 0개면 섹션 자체 미노출
    if (!attractions || attractions.length === 0) {
      $("#attractionsSection").hide();
      return;
    }
    $("#attractionsSection").show();

    const $preview = $("#attractionsPreview");
    $preview.empty();

    attractions.slice(0, 4).forEach((it) => {
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
        <div class="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
          <div class="flex items-center gap-2 min-w-0">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0"><i data-lucide="map-pin" style="width:14px;height:14px"></i></div>
            <div class="text-[14px] font-bold text-gray-900 truncate">${it.name}</div>
          </div>
          <div class="inline-flex items-center text-[16px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap">${it.distance}</div>
        </div>
      `);
    });

    refreshIcons();

    // 버튼: 4개 이하면 미표시, 5개 이상이면 표시 + 카운트 업데이트
    $("#attractionCount").text(attractions.length);
    if (attractions.length <= 4) {
      $("#openAttractions").hide();
    } else {
      $("#openAttractions").show();
    }
  }

  function renderRooms() {
    const $container = $("#roomsContainer");
    if (!$container.length) return;

    $container.empty();

    rooms.forEach((room, idx) => {
      const card = $(`
        <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-lg bg-white">
          <div class="js-room-mosaic"></div>
          <div class="p-5 pt-4">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-2xl font-black text-gray-900 tracking-tight">${room.name}</h3>
              <button class="js-open-room-info flex items-center text-gray-400 text-[11px] font-bold hover:text-blue-600" data-room="${idx}">상세보기 <i class="ml-0.5" data-lucide="chevron-right" style="width:12px;height:12px"></i></button>
            </div>
            <div class="flex items-center text-gray-500 text-xs mb-1 font-medium"><i class="mr-1 text-blue-500" data-lucide="users" style="width:14px;height:14px"></i><span>기준 ${room.minGuests}인 / 최대 ${room.maxGuests}인</span></div>
            <div class="text-[11px] text-gray-400 mb-2 font-medium">체크인 15:00 ~ 체크아웃 11:00</div>
            <div class="mb-2"><span class="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-100 inline-block shadow-sm">타사이트 대비 최저가보장</span></div>
            <div class="flex flex-col items-end -mt-8">
              <div class="flex items-center gap-1.5"><span class="text-red-500 font-extrabold text-xl">73%</span><span class="text-gray-300 line-through text-xs font-medium">550,000</span></div>
              <div class="flex flex-col items-end -mt-0.5">
                <span class="text-blue-600 text-[11px] font-black">최대할인가</span>
                <div class="flex items-center"><span class="text-3xl font-black text-gray-900 tracking-tighter">145,000원</span></div>
              </div>
            </div>
            <button class="js-open-reservation w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-5 shadow-lg active:bg-blue-700 active:scale-98 transition-all text-lg" data-room="${idx}">예약하기</button>
          </div>
        </div>
      `);

      $container.append(card);

      // mosaic
      const key = `room_${idx}`;
      renderMosaic(card.find(".js-room-mosaic"), key, room.images);
    });

    refreshIcons();
  }

  function renderRoomCard() {
    // backward compatibility (no-op)
    renderRooms();
  }

  function renderState() {
    // timer
    $("#promoTimer").text(formatTime(secondsRemaining));
    $("#promoTimer2").text(formatTime(secondsRemaining));

    // schedule button
    const nightsText = nights();
    // 메인 화면(객실 선택 > 일정 및 인원) 요약 텍스트
    $("#scheduleSummary").text(`${formatDate(startDate)} ~ ${formatDate(endDate)} (${nightsText}박) / ${totalGuests()}명`);

    $("#countAdults").text(adults);
    $("#countChildren").text(children);
    $("#countInfants").text(infants);
    // booking modal: 날짜는 임시 선택(bookingTempStart/End)을 사용하므로 여기서 덮어쓰지 않음

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
    // Ensure room detail is populated even when opened via history/hash
    if (sel === "#roomModal") {
      try { fillRoomModal(); } catch (e) {}
    }
    updateChrome();
  }

  function closeModal(sel) {
    $(sel).removeClass("is-open");
    updateChrome();
  }

  // -----------------------------
  // Gallery
  // -----------------------------
  function positionGalleryNav() {
    const stage = $("#galleryStage").get(0);
    const img = $("#galleryImage").get(0);
    if (!stage || !img) return;

    const stageRect = stage.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // 버튼이 '사진 안쪽'에 위치하도록, 실제 렌더된 이미지 영역을 기준으로 inset 계산
    const inset = 10;
    const left = Math.max(inset, Math.round(imgRect.left - stageRect.left + inset));
    const right = Math.max(inset, Math.round(stageRect.right - imgRect.right + inset));

    $("#galleryPrev").css({ left: `${left}px`, right: "auto" });
    $("#galleryNext").css({ right: `${right}px`, left: "auto" });
  }

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

    $("#galleryCounter").text(`${galleryActiveIndex + 1} / ${imgs.length}`);

    // 이미지 로드 후: 좌/우 버튼을 이미지 내부로 재배치
    $("#galleryImage").off("load").on("load", function () {
      positionGalleryNav();
    });
    $("#galleryImage").attr("src", imgs[galleryActiveIndex]);
    // 캐시된 이미지/빠른 렌더링 케이스 대비
    setTimeout(positionGalleryNav, 0);

    const $thumbs = $("#galleryThumbs");
    $thumbs.empty();

    imgs.forEach((src, i) => {
      const isActive = i === galleryActiveIndex;
      $thumbs.append(`
        <button class="gallery-thumb ${isActive ? "is-active" : ""}" data-idx="${i}" aria-label="thumb ${i + 1}" ${isActive ? "aria-current='true'" : ""}>
          <img src="${src}" alt="thumb-${i}" class="gallery-thumb-img" />
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

    // 캐시된 이미지 등 load 이벤트가 늦게/안 오는 경우 대비
    setTimeout(positionGalleryNav, 0);

    // 현재 보고 있는 썸네일이 항상 보이도록 자동 스크롤
    const $active = $thumbs.find(`button[data-idx='${galleryActiveIndex}']`);
    if ($active.length) {
      const el = $active.get(0);
      const manualScroll = () => {
        const left = $active.position().left + $thumbs.scrollLeft();
        const target = left - $thumbs.width() / 2 + $active.outerWidth() / 2;
        $thumbs.scrollLeft(target);
      };

      if (el && typeof el.scrollIntoView === "function") {
        try {
          el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        } catch {
          manualScroll();
        }
      } else {
        manualScroll();
      }
    }
  }

  // -----------------------------
  // Booking calendar (From ~ To)
  // -----------------------------
  function renderBookingCalendar() {
    const y = bookingViewMonth.getFullYear();
    const m = bookingViewMonth.getMonth();
    $("#bookingMonthLabel").text(`${y}년 ${m + 1}월`);

    const first = new Date(y, m, 1);
    const startWeekDay = first.getDay(); // 0: Sun
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const totalCells = 42; // 6주 고정(달력 높이 변동 방지)
    const $grid = $("#bookingCalendarGrid");
    $grid.empty();

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekDay + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        $grid.append(`<div class="booking-cal-day is-empty" aria-hidden="true"></div>`);
        continue;
      }

      const d = normalizeDate(new Date(y, m, dayNum));
      const iso = toISODate(d);

      const today0 = normalizeDate(new Date());
      const isPast = d.getTime() < today0.getTime();

      const cls = ["booking-cal-day"];
      if (isPast) cls.push("is-disabled");

      if (bookingTempStart && bookingTempEnd) {
        if (isSameDay(d, bookingTempStart)) cls.push("range-start");
        if (isSameDay(d, bookingTempEnd)) cls.push("range-end");
        if (d.getTime() > bookingTempStart.getTime() && d.getTime() < bookingTempEnd.getTime()) cls.push("in-range");
      } else if (bookingTempStart && !bookingTempEnd) {
        if (isSameDay(d, bookingTempStart)) cls.push("range-start");
      }

      $grid.append(
        `<button type="button" class="${cls.join(" ")}" data-date="${iso}" aria-label="${iso}" ${cls.includes("is-disabled") ? "disabled" : ""}>${dayNum}</button>`
      );
    }

    // day click
    $grid.find("button[data-date]").off("click").on("click", function () {
      const iso = String($(this).data("date"));
      const next = fromISODate(iso);

      if (!bookingTempStart || (bookingTempStart && bookingTempEnd)) {
        bookingTempStart = next;
        bookingTempEnd = null;
      } else {
        // start만 있는 상태
        if (next.getTime() < bookingTempStart.getTime()) {
          bookingTempStart = next;
        } else if (next.getTime() === bookingTempStart.getTime()) {
          bookingTempEnd = null;
        } else {
          bookingTempEnd = next;
        }
      }

      renderBookingModal();
    });
  }

  function renderBookingModal() {
    $("#bookingCheckInText").text(bookingTempStart ? formatFullDateKR(bookingTempStart) : "-");
    $("#bookingCheckOutText").text(bookingTempEnd ? formatFullDateKR(bookingTempEnd) : "-");
    renderBookingCalendar();
  }

  // -----------------------------
  // Timer (24h)
  // -----------------------------
  function initTimer() {
    // 파일/모바일 브라우저(특히 삼성 인터넷)에서 안정적으로 동작하도록 endTime 기준으로 계산
    const key = "villa_promo_end_time";
    let endTime = 0;
    try {
      endTime = parseInt(localStorage.getItem(key) || "0", 10);
    } catch {
      endTime = 0;
    }

    if (!endTime || Number.isNaN(endTime) || endTime <= Date.now()) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      try {
        localStorage.setItem(key, String(endTime));
      } catch {}
    }

    function tick() {
      const diff = Math.max(0, endTime - Date.now());
      secondsRemaining = Math.floor(diff / 1000);
      renderState();
    }

    tick();
    setInterval(tick, 1000);
  }

  
  function hideInvalidReviewButtons() {
    $(".js-open-review").each(function () {
      const url = $(this).data("url");
      if (url == null || url === "" || String(url).toLowerCase() === "null") {
        $(this).hide();
      }
    });
  }

// -----------------------------
  // Events
  // -----------------------------
  function bindEvents() {
    // open booking modal
    $("#openBooking").on("click", function () {
      bookingTempStart = startDate;
      bookingTempEnd = endDate;
      bookingViewMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      renderBookingModal();
      openModal("#bookingModal");
    });

    // calendar month nav
    $("#bookingCalPrev").on("click", function () {
      bookingViewMonth = new Date(bookingViewMonth.getFullYear(), bookingViewMonth.getMonth() - 1, 1);
      renderBookingCalendar();
    });
    $("#bookingCalNext").on("click", function () {
      bookingViewMonth = new Date(bookingViewMonth.getFullYear(), bookingViewMonth.getMonth() + 1, 1);
      renderBookingCalendar();
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

    // apply booking
    $("#bookingApply").on("click", function () {
      if (!bookingTempStart || !bookingTempEnd) {
        toast("체크인/체크아웃을 선택해주세요.");
        return;
      }
      if (bookingTempEnd.getTime() <= bookingTempStart.getTime()) {
        toast("체크아웃은 체크인 이후 날짜여야 합니다.");
        return;
      }
      startDate = bookingTempStart;
      endDate = bookingTempEnd;
      closeModal("#bookingModal");
      renderState();
    });

    // open gallery from mosaic images
    $(document).on("click", "[data-gallery][data-index]", function (e) {
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

    // 모바일: 좌/우 스와이프로 이미지 넘기기
    let gTouchStartX = 0;
    let gTouchStartY = 0;
    $("#galleryStage").on("touchstart", function (e) {
      const t = e.originalEvent.touches && e.originalEvent.touches[0];
      if (!t) return;
      gTouchStartX = t.clientX;
      gTouchStartY = t.clientY;
    });
    $("#galleryStage").on("touchend", function (e) {
      const t = e.originalEvent.changedTouches && e.originalEvent.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - gTouchStartX;
      const dy = t.clientY - gTouchStartY;

      // 가로 스와이프만 인식
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) {
          galleryActiveIndex += 1;
        } else {
          galleryActiveIndex -= 1;
        }
        renderGallery();
      }
    });

    // 화면 회전/리사이즈 시 버튼 위치 재계산
    $(window).on("resize", function () {
      if ($("#galleryModal").hasClass("is-open")) {
        positionGalleryNav();
      }
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
      if (url == null || url === "" || String(url).toLowerCase() === "null") return;
      $("#reviewFrame").attr("src", url);
      openModal("#reviewModal");
    });
    // room info / reservation (N개 객실 대응)
    $(document).on("click", ".js-open-room-info", function () {
      const idx = parseInt($(this).data("room"), 10);
      setActiveRoom(isNaN(idx) ? 0 : idx);

      // 메인 스크롤 위치 보존
      lastMainScrollY = window.scrollY || 0;
      try {
        sessionStorage.setItem("mainScrollY", String(lastMainScrollY));
      } catch {}

      fillRoomModal();
      openModal("#roomModal");

      // 뒤로가기(브라우저 back)로 메인 복귀 가능하도록 히스토리 상태 추가
      try {
        if (location.hash !== "#room") {
          history.pushState({ view: "room", room: activeRoomIndex }, "", "#room");
        }
      } catch {}
    });

    $(document).on("click", ".js-open-reservation", function () {
      const idx = parseInt($(this).data("room"), 10);
      setActiveRoom(isNaN(idx) ? 0 : idx);
      // 예약하기: 모달이 아니라 예약페이지로 이동(일정/인원 이어받기)
      const room = getActiveRoom();
      if (!room) return;

      // 메인 상태(일정/인원/스크롤) 보존: 예약페이지 뒤로가기 시 그대로 복원
      saveMainReturnState();

      const params = new URLSearchParams({
        room: String(room.name),
        checkin: formatISODate(startDate),
        checkout: formatISODate(endDate),
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        minGuests: String(room.minGuests || 0),
        maxGuests: String(room.maxGuests || 0),
        checkinTime: String(room.checkIn || "15:00"),
        checkoutTime: String(room.checkOut || "11:00")
      });
      window.location.href = `reservation.html?${params.toString()}`;
    });

    // reserve (room detail view): 예약페이지로 이동(일정/인원 이어받기)
    $("#roomReserve").on("click", function () {
      const room = getActiveRoom();
      if (!room) return;

      // 메인 상태(일정/인원/스크롤) 보존: 예약페이지 뒤로가기 시 그대로 복원
      saveMainReturnState(lastMainScrollY || window.scrollY || 0);

      const params = new URLSearchParams({
        room: String(room.name),
        checkin: formatISODate(startDate),
        checkout: formatISODate(endDate),
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        minGuests: String(room.minGuests || 0),
        maxGuests: String(room.maxGuests || 0),
        checkinTime: String(room.checkIn || "15:00"),
        checkoutTime: String(room.checkOut || "11:00")
      });
      window.location.href = `reservation.html?${params.toString()}`;
    });

    // room detail back (메인 복귀 + 스크롤 유지)
    $("#roomBack").on("click", function () {
      // 히스토리로 열렸다면 back으로 복귀
      if (location.hash === "#room") {
        history.back();
        return;
      }
      closeModal("#roomModal");
      const y = lastMainScrollY || parseInt(sessionStorage.getItem("mainScrollY") || "0", 10);
      setTimeout(() => window.scrollTo(0, y), 0);
    });

    // 브라우저 뒤로가기 시 room detail 닫기
    window.addEventListener("popstate", function () {
      if (location.hash !== "#room" && $("#roomModal").hasClass("is-open")) {
        closeModal("#roomModal");
        const y = lastMainScrollY || parseInt(sessionStorage.getItem("mainScrollY") || "0", 10);
        setTimeout(() => window.scrollTo(0, y), 0);
      }
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
    // 예약페이지에서 뒤로가기 복귀(일정/인원/스크롤 유지)
    const didRestore = restoreMainReturnStateIfRequested();

    // initial render
    renderMosaic($("#mainMosaic"), "main", mainImages);
    renderFacilities();
    renderAttractions();
    renderRooms();
    // 객실 상세보기(모달) 기본 데이터 세팅
    fillRoomModal();

    // icons
    refreshIcons();

    // hide review buttons with null url
    hideInvalidReviewButtons();

    // events
    bindEvents();

    // state
    renderState();
    updateChrome();

    // timer
    initTimer();

    // restore scroll if requested
    if (didRestore) {
      try {
        const y = parseInt(sessionStorage.getItem("mainScrollY") || "0", 10);
        if (Number.isFinite(y) && y >= 0) setTimeout(() => window.scrollTo(0, y), 0);
      } catch {}
    }
  });
})(jQuery);
