// ================= NAVBAR FUNCTION ================= //
// Toàn bộ code xử lý Navbar của bạn (menu toggle, hide/show on scroll)
// NÊN NẰM NGOÀI document.addEventListener("DOMContentLoaded")
// vì các biến và sự kiện này cần được khai báo ngay khi script tải

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const navbar = document.querySelector('.navbar'); // Lấy navbar element

// Toggle menu cho mobile
if (menu && menuLinks) {
    menu.addEventListener('click', function () {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
        // Khi mở/đóng menu mobile, có thể cần đảm bảo navbar hiển thị đầy đủ
        // Hoặc tắt animation ẩn/hiện tạm thời để tránh xung đột
        if (navbar) {
            if (menuLinks.classList.contains('active')) {
                gsap.to(navbar, { y: 0, duration: 0.3, ease: "power2.out" });
                navbar.classList.add('mobile-menu-active'); // Thêm class để CSS có thể giữ toggle
            } else {
                navbar.classList.remove('mobile-menu-active');
            }
        }
    });
}


let lastScrollTop = 0;
// Không cần khai báo lại const navbar ở đây

if (navbar) {
    // Tạo một animation GSAP cho navbar
    let navHideAnimation = gsap.to(navbar, {
        yPercent: -100, // Ẩn hoàn toàn lên trên
        paused: true,   // Tạm dừng ban đầu
        duration: 0.3,  // Thời gian animation
        ease: "power2.inOut" // Kiểu chuyển động
    });

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Nếu menu mobile đang mở, KHÔNG ẩn navbar
        if (menuLinks && menuLinks.classList.contains('active')) {
            navHideAnimation.reverse(); // Đảm bảo navbar hiển thị
            lastScrollTop = currentScroll; // Cập nhật để tránh nhảy khi đóng menu
            return; // Thoát khỏi hàm cuộn
        }

        if (currentScroll > lastScrollTop && currentScroll > 60) { // Cuộn xuống và đã qua phần top của navbar
            navHideAnimation.play(); // Chạy animation ẩn
        } else { // Cuộn lên hoặc ở top trang
            navHideAnimation.reverse(); // Chạy animation hiện
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
}


// ================= GSAP SCROLL-BASED ANIMATIONS ================= //
// TOÀN BỘ CÁC PHẦN DÙNG GSAP VÀ SCROLLTRIGGER NÊN NẰM TRONG ĐÂY
document.addEventListener("DOMContentLoaded", function () {
    // Đảm bảo đăng ký plugin trước tiên
    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

    // Code cho Scroll Panels (Horizontal Scroll)
    const panels = gsap.utils.toArray("#panels-container .panel");
    const panelsContainer = document.querySelector("#panels-container");

    const tween = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
            trigger: "#panels-container",
            pin: true,
            start: "top top",
            scrub: 1,
            snap: {
                snapTo: 1 / (panels.length - 1),
                inertia: false,
                duration: { min: 0.1, max: 0.1 }
            },
            end: () => "+=" + (panelsContainer.offsetWidth - window.innerWidth),
            // markers: true // BẬT ĐỂ DEBUG
        }
    });

    // Anchor link click scroll (nếu bạn dùng)
    document.querySelectorAll(".anchor").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const href = this.getAttribute("href");
            const targetElem = document.querySelector(href);
            if (!targetElem) return;
            let y = targetElem;
            if (panelsContainer.contains(targetElem)) {
                const totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start;
                const totalMovement = (panels.length - 1) * targetElem.offsetWidth;
                y = Math.round(
                    tween.scrollTrigger.start +
                    (targetElem.offsetLeft / totalMovement) * totalScroll
                );
            }
            gsap.to(window, {
                scrollTo: { y: y, autoKill: false },
                duration: 1
            });
        });
    });


    // ================= MAP SECTION FADE IN/OUT LIST ITEMS ================= //
    const fadeListItems = gsap.utils.toArray('.fade-list li');

    console.log("Tìm thấy các items trong fade-list:", fadeListItems.length);
    if (fadeListItems.length === 0) {
        console.warn("Không tìm thấy bất kỳ phần tử .fade-list li nào. Vui lòng kiểm tra lại HTML selector.");
    }

    // Đặt trạng thái ban đầu của các li: hơi mờ và dịch xuống một chút
    gsap.set(fadeListItems, { opacity: 0.2, y: 20 });

    fadeListItems.forEach((item, i) => {
        gsap.timeline({
            scrollTrigger: {
                trigger: item, // Trigger chính là mỗi item li
                start: 'top 80%', // Khi đỉnh của item chạm 80% từ trên xuống của viewport
                end: 'bottom 20%', // Khi đáy của item chạm 20% từ trên xuống của viewport
                scrub: true, // Animation sẽ cuộn theo thanh cuộn
                markers: true, // **QUAN TRỌNG: BẬT MARKER ĐỂ DEBUG**
                // toggleActions: 'play reverse play reverse' // Không cần dùng toggleActions với scrub
            }
        })
        .to(item, {
            opacity: 1, // Làm item rõ dần
            y: 0, // Di chuyển item về vị trí ban đầu
            ease: "power1.out",
            duration: 0.5 // Thời gian animation (với scrub, duration chỉ là tỉ lệ)
        })
        .to(item, { // Để item mờ dần và dịch lên khi đi qua
            opacity: 0.2,
            y: -20,
            ease: "power1.in",
            duration: 0.5 // Thời gian animation
        }, 0.5); // Bắt đầu animation thứ hai sau 0.5 giây của timeline
        // Hoặc có thể dùng "<" để bắt đầu cùng lúc với tween trước đó.
        // Với scrub, thời gian không phải là giây mà là tỉ lệ của hành trình cuộn.
    });

    // Thêm một ScrollTrigger tổng thể cho phần sticky của map-left
    const mapLeft = document.querySelector('.map-left');
    const mapContent = document.querySelector('.mapsc_m .content');

    if (mapLeft && mapContent) {
        console.log("Tìm thấy .map-left và .mapsc_m .content cho hiệu ứng sticky.");
        gsap.to(mapLeft, {
            // Không cần tween, chỉ cần ScrollTrigger để điều khiển sticky CSS
            scrollTrigger: {
                trigger: mapContent, // Phần tử cha mà map-left sẽ dính trong đó
                start: 'top top', // Khi đỉnh của mapContent chạm đỉnh viewport
                end: 'bottom bottom', // Khi đáy của mapContent chạm đáy viewport
                pin: true, // Đã có position: sticky trong CSS, nhưng pin có thể giúp đỡ
                pinSpacing: false, // Để tránh thêm khoảng trống không mong muốn
                markers: true, // BẬT MARKER ĐỂ DEBUG HIỆU ỨNG STICKY
                // Khi pin: true được sử dụng, nó sẽ tự động thêm CSS để làm cho phần tử dính.
                // Tuy nhiên, vì bạn đã có position: sticky trong CSS, chúng ta sẽ cần kiểm tra xem có xung đột không.
                // Một cách khác là chỉ sử dụng CSS sticky và không dùng pin của ScrollTrigger nếu sticky hoạt động.
                // Giữ pin: true ở đây để xem nó có khắc phục được không.
            }
        });
    } else {
        console.warn("Không tìm thấy .map-left hoặc .mapsc_m .content để kích hoạt hiệu ứng sticky.");
    }

});

        document.addEventListener('DOMContentLoaded', () => {
            // Select the main section to observe
            const mapSection = document.getElementById('map');
            // Select all elements within the section that should fade in
            const mapHeader = mapSection.querySelector('.map-header');
            const mapItems = mapSection.querySelectorAll('.map-item');

            // Options for the Intersection Observer
            // rootMargin: Defines the margin around the root element.
            // A positive value shrinks the intersection rectangle, a negative value expands it.
            // Here, we trigger the animation when the section is 10% visible (or more).
            const observerOptions = {
                root: null, // Use the viewport as the root
                rootMargin: '0px',
                threshold: 0.5 // Trigger when 10% of the section is visible
            };

            // Create a new Intersection Observer
            const sectionObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // Check if the observed section is intersecting (visible in the viewport)
                    if (entry.isIntersecting) {
                        // If it is, add the 'fade-in-visible' class to the header
                        mapHeader.classList.add('fade-in-visible');

                        // Loop through each map item and add the fade-in class with a staggered delay
                        mapItems.forEach((item, index) => {
                            // Calculate a delay for each item (e.g., 200ms delay per item)
                            const delay = index * 250; // Staggered delay in milliseconds
                            setTimeout(() => {
                                item.classList.add('fade-in-visible');
                            }, delay);
                        });

                        // Stop observing once the animation has been triggered
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Start observing the #map section
            sectionObserver.observe(mapSection);
        });