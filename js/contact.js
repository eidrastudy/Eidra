(function() {
      // Hamburger menu (same as all pages)
      const hamburger = document.getElementById('hamburger');
      const mobileNav = document.getElementById('mobileNav');
      const closeBtn = document.getElementById('closeNav');

      function openNav() { mobileNav.classList.add('active'); }
      function closeNav() { mobileNav.classList.remove('active'); }

      if (hamburger) hamburger.addEventListener('click', openNav);
      if (closeBtn) closeBtn.addEventListener('click', closeNav);

      const mobileLinks = mobileNav.querySelectorAll('a');
      mobileLinks.forEach(link => link.addEventListener('click', closeNav));

      // WhatsApp button demo alerts
      const whatsappBtns = document.querySelectorAll('#whatsappContactBtn, #whatsappCommunityFooter');
      whatsappBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('📱 WhatsApp community link would open here. (Demo)');
        });
      });
    })();