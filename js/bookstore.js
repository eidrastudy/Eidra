(function () {
    // ==================== CONFIG ====================
    const DATA_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwX1ypFg8Ax33idGhTqxsfrv-lFhIu-dxj6ApXi7aniPCI6H7ze3m-7ADth5wW6PvNB/exec";
    const FEEDBACK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQTH4g_EjBnC5mpDfQw6SC7w17No4DDorfit2lZxfMaKRLzjnWVz-nixwbGO7AXF17/exec";

    // ==================== BOOKS ====================
    const books = [
        { title: "C Unlocked: Mastering the Language of Systems", file: "books/c unlocked.pdf" },
        { title: "Digital Electronics and Computer Organization", file: "books/digital-electronic.pdf" },
        { title: "Organizational Behavior: Understanding People at Work", file: "books/organizational-behavior.pdf" },
    ];

    // ==================== DOM ====================
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const fullName = document.getElementById('fullName');
    const mobile = document.getElementById('mobile');
    const email = document.getElementById('email');
    const degreeInput = document.getElementById('degree');
    const semesterSelect = document.getElementById('semester');
    const bookSearch = document.getElementById('bookSearch');
    const suggestionsDiv = document.getElementById('suggestions');
    const continueBtn = document.getElementById('continueBtn');
    const goBackLink = document.getElementById('goBackLink');
    const downloadLink = document.getElementById('downloadLink');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const selectedNameSpan = document.getElementById('selectedName');
    const selectedEmailSpan = document.getElementById('selectedEmail');
    const selectedDegreeSpan = document.getElementById('selectedDegree');
    const selectedSemesterSpan = document.getElementById('selectedSemester');
    const selectedBookTitleSpan = document.getElementById('selectedBookTitle');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackText = document.getElementById('feedbackText');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const skipFeedbackBtn = document.getElementById('skipFeedbackBtn');
    const feedbackSuccessMsg = document.getElementById('feedbackSuccessMsg');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // ==================== STATE ====================
    let selectedBook = null;
    let highlightedIndex = -1;
    let currentSuggestions = [];
    let feedbackTimer = null;
    let isSubmittingFeedback = false;
    let userData = {};
    let mobileValid = false;
    const DOWNLOAD_LIMIT = 3;
    const STORAGE_KEY = 'eidra_downloads';

    // ==================== MOBILE VALIDATION ====================
    function validateMobile(num) {
        const cleaned = num.replace(/\D/g, '');
        if (cleaned.length !== 10) return { valid: false, msg: 'Must be exactly 10 digits' };
        if (!/^[6-9]/.test(cleaned)) return { valid: false, msg: 'Must start with 6,7,8,9' };
        if (/^(\d)\1{9}$/.test(cleaned)) return { valid: false, msg: 'Repeated digits not allowed' };
        return { valid: true, msg: 'Valid mobile number' };
    }

    function updateMobileValidation() {
        const num = mobile.value.trim();
        const result = validateMobile(num);
        const field = mobile.closest('.input-field');
        const feedbackEl = document.getElementById('mobile-feedback');

        if (num === '') {
            field.classList.remove('valid', 'invalid');
            feedbackEl.textContent = '';
            mobileValid = false;
        } else if (result.valid) {
            field.classList.add('valid');
            field.classList.remove('invalid');
            feedbackEl.textContent = '✓ Valid number';
            mobileValid = true;
        } else {
            field.classList.add('invalid');
            field.classList.remove('valid');
            feedbackEl.textContent = result.msg;
            mobileValid = false;
        }

        validateForm();
    }

    mobile.addEventListener('input', updateMobileValidation);

    // ==================== DOWNLOAD LIMIT ====================
    function checkDownloadLimit(mobileNum) {
        const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        for (let num in records) {
            records[num] = records[num].filter(ts => now - ts < oneHour);
        }

        const num = mobileNum.replace(/\D/g, '');

        if (!records[num]) records[num] = [];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

        return records[num].length < DOWNLOAD_LIMIT;
    }

    function recordDownload(mobileNum) {
        const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const num = mobileNum.replace(/\D/g, '');

        if (!records[num]) records[num] = [];

        records[num].push(Date.now());

        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    // ==================== SEARCH ====================
    function getFilteredBooks(query) {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();

        return books.filter(book =>
            book.title.toLowerCase().includes(lowerQuery)
        );
    }

    function renderSuggestions() {
        const query = bookSearch.value;
        const matches = getFilteredBooks(query);

        currentSuggestions = matches;

        suggestionsDiv.innerHTML = '';

        matches.forEach((book, idx) => {

            const item = document.createElement('div');

            item.classList.add('suggestion-item');

            item.textContent = book.title;

            item.addEventListener('click', () => selectBook(book));

            suggestionsDiv.appendChild(item);
        });

        suggestionsDiv.classList.toggle('show', matches.length > 0);
    }

    function selectBook(book) {

        bookSearch.value = book.title;

        selectedBook = { title: book.title, file: book.file };

        suggestionsDiv.classList.remove('show');

        validateForm();
    }

    bookSearch.addEventListener('input', () => {

        selectedBook = null;

        renderSuggestions();

        validateForm();
    });

    // ==================== FORM VALIDATION ====================
    function validateForm() {

        const nameVal = fullName.value.trim();

        const mobileVal = mobile.value.trim();

        const emailVal = email.value.trim();

        const degreeVal = degreeInput.value;

        const semesterVal = semesterSelect.value;

        const emailValid = emailVal.includes('@');

        const allValid =
            nameVal !== '' &&
            mobileValid &&
            emailValid &&
            degreeVal !== '' &&
            semesterVal !== '' &&
            selectedBook !== null;

        continueBtn.disabled = !allValid;

        if (selectedBook) {
            step1.classList.add('active');
        } else {
            step1.classList.remove('active');
        }
    }

    // ==================== GOOGLE SHEETS ====================
    function submitToGoogleSheets(data) {

        const formData = new FormData();

        formData.append("name", data.name);

        formData.append("email", data.email);

        formData.append("mobile", data.mobile);

        formData.append("degree", data.degree);

        formData.append("semester", data.semester);

        formData.append("book", data.book);

        fetch(DATA_SCRIPT_URL, {

            method: "POST",

            body: formData

        }).catch(err => console.error(err));
    }

    // ==================== SCREEN NAVIGATION ====================
    function showScreen2() {

        const mobileNum = mobile.value.trim();

        if (!checkDownloadLimit(mobileNum)) {

            alert("Download limit reached. Try again later.");

            return;
        }

        selectedNameSpan.textContent = fullName.value.trim();
        selectedEmailSpan.textContent = email.value.trim();
        selectedDegreeSpan.textContent = degreeInput.value;
        selectedSemesterSpan.textContent = semesterSelect.value;
        selectedBookTitleSpan.textContent = selectedBook.title;

        // ✅ REAL DOWNLOAD LINK
        downloadLink.href = selectedBook.file;
        downloadLink.download = selectedBook.file.split('/').pop();

        userData = {
            name: fullName.value.trim(),
            email: email.value.trim(),
            mobile: mobileNum,
            degree: degreeInput.value,
            semester: semesterSelect.value,
            book: selectedBook.title
        };

        submitToGoogleSheets(userData);

        recordDownload(mobileNum);

        screen1.classList.add('hidden');

        screen2.classList.remove('hidden');

        step3.classList.add('active');

        if (feedbackTimer) clearTimeout(feedbackTimer);

        feedbackTimer = setTimeout(() => {

            feedbackModal.classList.add('show');

        }, 3000);
    }

    continueBtn.addEventListener('click', function (e) {

        e.preventDefault();

        if (continueBtn.disabled) return;

        showScreen2();
    });

})();            const feedbackSuccessMsg = document.getElementById('feedbackSuccessMsg');
            const mobileFeedback = document.getElementById('mobile-feedback');
            const step1 = document.getElementById('step1');
            const step2 = document.getElementById('step2');
            const step3 = document.getElementById('step3');

            // ==================== STATE ====================
            let selectedBook = null;
            let highlightedIndex = -1;
            let currentSuggestions = [];
            let feedbackTimer = null;
            let isSubmittingFeedback = false;
            let userData = {};
            let mobileValid = false;
            const DOWNLOAD_LIMIT = 3;
            const STORAGE_KEY = 'eidra_downloads';

            // ==================== HAMBURGER ====================
            const hamburger = document.getElementById('hamburger');
            const mobileNav = document.getElementById('mobileNav');
            const closeNav = document.getElementById('closeNav');
            if (hamburger) hamburger.addEventListener('click', () => mobileNav.classList.add('active'));
            if (closeNav) closeNav.addEventListener('click', () => mobileNav.classList.remove('active'));
            mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileNav.classList.remove('active')));

            // ==================== MOBILE VALIDATION (Indian) ====================
            function validateMobile(num) {
                const cleaned = num.replace(/\D/g, '');
                if (cleaned.length !== 10) return { valid: false, msg: 'Must be exactly 10 digits' };
                if (!/^[6-9]/.test(cleaned)) return { valid: false, msg: 'Must start with 6,7,8,9' };
                if (/^(\d)\1{9}$/.test(cleaned)) return { valid: false, msg: 'Repeated digits not allowed' };
                return { valid: true, msg: 'Valid mobile number' };
            }

            function updateMobileValidation() {
                const num = mobile.value.trim();
                const result = validateMobile(num);
                const field = mobile.closest('.input-field');
                const feedbackEl = document.getElementById('mobile-feedback');
                if (num === '') {
                    field.classList.remove('valid', 'invalid');
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'validation-feedback';
                    mobileValid = false;
                } else if (result.valid) {
                    field.classList.add('valid');
                    field.classList.remove('invalid');
                    feedbackEl.textContent = '✓ Valid number';
                    feedbackEl.className = 'validation-feedback valid';
                    mobileValid = true;
                } else {
                    field.classList.add('invalid');
                    field.classList.remove('valid');
                    feedbackEl.textContent = result.msg;
                    feedbackEl.className = 'validation-feedback invalid';
                    mobileValid = false;
                }
                validateForm();
            }

            mobile.addEventListener('input', updateMobileValidation);
            mobile.addEventListener('blur', updateMobileValidation);

            // ==================== DOWNLOAD LIMIT ====================
            function checkDownloadLimit(mobileNum) {
                const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;
                // clean old records (>1 hour)
                for (let num in records) {
                    records[num] = records[num].filter(ts => now - ts < oneHour);
                }
                const num = mobileNum.replace(/\D/g, '');
                if (!records[num]) records[num] = [];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
                return records[num].length < DOWNLOAD_LIMIT;
            }

            function recordDownload(mobileNum) {
                const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
                const num = mobileNum.replace(/\D/g, '');
                if (!records[num]) records[num] = [];
                records[num].push(Date.now());
                localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            }

            // ==================== SEARCH ====================
            function isFuzzyMatch(searchTerm, title) {
                if (!searchTerm) return false;
                const s = searchTerm.toLowerCase();
                const t = title.toLowerCase();
                let sIdx = 0;
                for (let i = 0; i < t.length; i++) {
                    if (t[i] === s[sIdx]) {
                        sIdx++;
                        if (sIdx === s.length) return true;
                    }
                }
                return false;
            }

            function getFilteredBooks(query) {
                if (!query.trim()) return [];
                const lowerQuery = query.toLowerCase().trim();
                const results = [];
                books.forEach(book => {
                    const titleLower = book.title.toLowerCase();
                    let rank;
                    if (titleLower.startsWith(lowerQuery)) rank = 0;
                    else if (titleLower.includes(lowerQuery)) rank = 1;
                    else if (isFuzzyMatch(lowerQuery, titleLower)) rank = 2;
                    else rank = -1;
                    if (rank !== -1) results.push({ book, rank });
                });
                results.sort((a, b) => {
                    if (a.rank !== b.rank) return a.rank - b.rank;
                    return a.book.title.localeCompare(b.book.title);
                });
                return results.slice(0, 6).map(item => item.book);
            }

            function renderSuggestions() {
                const query = bookSearch.value;
                const matches = getFilteredBooks(query);
                currentSuggestions = matches;
                suggestionsDiv.innerHTML = '';

                if (matches.length === 0 && query.trim() !== '') {
                    const noResult = document.createElement('div');
                    noResult.classList.add('no-result');
                    noResult.textContent = 'No books found';
                    suggestionsDiv.appendChild(noResult);
                    suggestionsDiv.classList.add('show');
                    highlightedIndex = -1;
                    return;
                } else if (matches.length === 0) {
                    suggestionsDiv.classList.remove('show');
                    highlightedIndex = -1;
                    return;
                }

                matches.forEach((book, idx) => {
                    const item = document.createElement('div');
                    item.classList.add('suggestion-item');
                    if (idx === highlightedIndex) item.classList.add('highlighted');
                    item.textContent = book.title;
                    item.addEventListener('click', () => selectBook(book));
                    suggestionsDiv.appendChild(item);
                });

                suggestionsDiv.classList.add('show');
            }

            function selectBook(book) {
                bookSearch.value = book.title;
                selectedBook = { title: book.title, file: book.file };
                suggestionsDiv.classList.remove('show');
                highlightedIndex = -1;
                validateForm();
            }

            function handleKeyDown(e) {
                const suggestionsShown = suggestionsDiv.classList.contains('show');
                if (!suggestionsShown || currentSuggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (highlightedIndex < currentSuggestions.length - 1) highlightedIndex++;
                    else highlightedIndex = 0;
                    updateHighlight();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (highlightedIndex > 0) highlightedIndex--;
                    else highlightedIndex = currentSuggestions.length - 1;
                    updateHighlight();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < currentSuggestions.length) {
                        selectBook(currentSuggestions[highlightedIndex]);
                    }
                }
            }

            function updateHighlight() {
                const items = suggestionsDiv.querySelectorAll('.suggestion-item');
                items.forEach((item, idx) => {
                    if (idx === highlightedIndex) {
                        item.classList.add('highlighted');
                        item.scrollIntoView({ block: 'nearest' });
                    } else {
                        item.classList.remove('highlighted');
                    }
                });
            }

            bookSearch.addEventListener('input', () => {
                selectedBook = null;
                highlightedIndex = -1;
                renderSuggestions();
                validateForm();
            });
            bookSearch.addEventListener('keydown', handleKeyDown);
            document.addEventListener('click', (e) => {
                if (!bookSearch.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                    suggestionsDiv.classList.remove('show');
                    highlightedIndex = -1;
                }
            });

            // ==================== FORM VALIDATION ====================
            function validateForm() {
                const nameVal = fullName.value.trim();
                const mobileVal = mobile.value.trim();
                const emailVal = email.value.trim();
                const degreeVal = degreeInput.value;
                const semesterVal = semesterSelect.value;

                const digits = mobileVal.replace(/\D/g, '');
                const mobileValidRule = mobileValid; // from validation function
                const emailValid = emailVal.includes('@') && emailVal.length > 3;
                const bookValid = selectedBook !== null;

                const allValid = nameVal !== '' && mobileValidRule && emailValid && degreeVal !== '' && semesterVal !== '' && bookValid;
                continueBtn.disabled = !allValid;

                // update step indicator
                if (selectedBook) {
                    step1.classList.add('active');
                } else {
                    step1.classList.remove('active');
                }
                // step2 active when form partially filled? we keep it simple: active when on screen1
            }

            [fullName, email, degreeInput, semesterSelect].forEach(el => {
                el.addEventListener('input', validateForm);
                el.addEventListener('change', validateForm);
            });
            bookSearch.addEventListener('blur', validateForm);
            validateForm();

            // ==================== GOOGLE SHEETS ====================
            function submitToGoogleSheets(data) {
                const formData = new FormData();
                formData.append("type", "download");
                formData.append("name", data.name);
                formData.append("email", data.email);
                formData.append("mobile", data.mobile);
                formData.append("degree", data.degree);
                formData.append("semester", data.semester);
                formData.append("book", data.book);
                fetch(DATA_SCRIPT_URL, { method: "POST", body: formData }).catch(err => console.error(err));
            }

            // ==================== SCREEN NAVIGATION ====================
            function showScreen2() {
                // check download limit
                const mobileNum = mobile.value.trim();
                if (!checkDownloadLimit(mobileNum)) {
                    alert("You have reached the download limit for now. Please try again later.");
                    return;
                }

                selectedNameSpan.textContent = fullName.value.trim();
                selectedEmailSpan.textContent = email.value.trim();
                selectedDegreeSpan.textContent = degreeInput.value;
                selectedSemesterSpan.textContent = semesterSelect.value;
                selectedBookTitleSpan.textContent = selectedBook.title;

                const dummyContent = `Eidra academic book: ${selectedBook.title}\nAuthor: Eidra Platform\nThis is a simulated PDF file.`;
                const blob = new Blob([dummyContent], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                const fileName = selectedBook.file.split('/').pop() || 'eidra-book.pdf';
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;

                userData = {
                    name: fullName.value.trim(),
                    email: email.value.trim(),
                    mobile: mobileNum,
                    degree: degreeInput.value,
                    semester: semesterSelect.value,
                    book: selectedBook.title,
                    timestamp: new Date().toISOString()
                };

                submitToGoogleSheets(userData);
                recordDownload(mobileNum);

                screen1.classList.add('hidden');
                screen2.classList.remove('hidden');
                step1.classList.remove('active');
                step2.classList.remove('active');
                step3.classList.add('active');

                if (feedbackTimer) clearTimeout(feedbackTimer);
                feedbackTimer = setTimeout(() => {
                    if (!screen2.classList.contains('hidden')) {
                        feedbackModal.classList.add('show');
                    }
                }, 3000);
            }

            continueBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (continueBtn.disabled) return;
                showScreen2();
            });

            goBackLink.addEventListener('click', function (e) {
                e.preventDefault();
                screen2.classList.add('hidden');
                screen1.classList.remove('hidden');
                feedbackModal.classList.remove('show');
                step1.classList.add('active');
                step2.classList.remove('active');
                step3.classList.remove('active');
                if (feedbackTimer) {
                    clearTimeout(feedbackTimer);
                    feedbackTimer = null;
                }
                validateForm();
            });

            // ==================== FEEDBACK ====================
            function submitFeedback() {
                if (isSubmittingFeedback) return;
                const feedback = feedbackText.value.trim();
                const feedbackData = {
                    name: userData.name || "",
                    email: userData.email || "",
                    book: userData.book || "",
                    feedback: feedback
                };
                const formData = new FormData();
                formData.append("name", feedbackData.name);
                formData.append("email", feedbackData.email);
                formData.append("book", feedbackData.book);
                formData.append("feedback", feedbackData.feedback);

                isSubmittingFeedback = true;
                submitFeedbackBtn.disabled = true;
                submitFeedbackBtn.textContent = "Sending...";

                fetch(FEEDBACK_SCRIPT_URL, { method: "POST", body: formData })
                    .then(() => {
                        feedbackSuccessMsg.style.display = "block";
                        submitFeedbackBtn.style.display = "none";
                        setTimeout(() => {
                            feedbackModal.classList.remove('show');
                        }, 1500);
                    })
                    .catch((err) => {
                        console.error("Feedback error:", err);
                        alert("Failed to send feedback.");
                        submitFeedbackBtn.disabled = false;
                        submitFeedbackBtn.textContent = "Submit Feedback";
                    })
                    .finally(() => {
                        isSubmittingFeedback = false;
                    });
            }

            submitFeedbackBtn.addEventListener("click", (e) => {
                e.preventDefault();
                submitFeedback();
            });

            skipFeedbackBtn.addEventListener("click", () => {
                feedbackModal.classList.remove('show');
            });

            feedbackModal.addEventListener("click", (e) => {
                if (e.target === feedbackModal) feedbackModal.classList.remove('show');
            });

            // ==================== SHARE ====================
            const shareBtn = document.getElementById('shareWhatsAppBtn');
            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const text = encodeURIComponent("Check out Eidra – free academic books for B.Tech & BCA students: https://eidra.com/books");
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                });
            }

        })();


