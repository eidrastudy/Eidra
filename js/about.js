 (function() {
      const hamburger = document.getElementById('hamburger');
      const mobileNav = document.getElementById('mobileNav');
      const closeBtn = document.getElementById('closeNav');

      function openNav() { mobileNav.classList.add('active'); }
      function closeNav() { mobileNav.classList.remove('active'); }

      if (hamburger) hamburger.addEventListener('click', openNav);
      if (closeBtn) closeBtn.addEventListener('click', closeNav);

      const mobileLinks = mobileNav.querySelectorAll('a');
      mobileLinks.forEach(link => link.addEventListener('click', closeNav));

      // Demo WhatsApp button alert
      const whatsappBtn = document.getElementById('communityJoinBtn');
      if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('📱 WhatsApp community link would open here. (Demo)');
        });
      }

      // Demo Contact Us button
      const contactBtn = document.querySelector('.cta-card .btn-secondary');
      if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('📧 Contact page demo.');
        });
      }
    })();