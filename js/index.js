 (function() {
      const hamburger = document.getElementById('hamburger');
      const mobileNav = document.getElementById('mobileNav');
      const closeBtn = document.getElementById('closeNav');

      function openNav() {
        mobileNav.classList.add('active');
      }

      function closeNav() {
        mobileNav.classList.remove('active');
      }

      if (hamburger) {
        hamburger.addEventListener('click', openNav);
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', closeNav);
      }

      // Close when clicking a link
      const mobileLinks = mobileNav.querySelectorAll('a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', closeNav);
      });

      // WhatsApp demo alerts
      const whatsappBtns = document.querySelectorAll('#whatsappHeroBtn, #whatsappCommunityBtn');
      whatsappBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('📱 WhatsApp community link would open here. (Demo)');
        });
      });

      console.log('Eidra homepage loaded — hamburger works!');
    })();