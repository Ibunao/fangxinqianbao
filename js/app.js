/**
 * 放鑫钱包 Landing Page - App Logic
 * Handles page navigation, form interactions, and animations
 */

// ======================================
// Global State
// ======================================
const state = {
  currentPage: 'page1',
  formData: {
    phone: '',
    name: '',
    age: '',
    gender: '',
    expectedAmount: '',
    loanPeriod: '', // 借款期限
    assets: [], // Array for multiple select
    zhima: '',
    applyIntent: '',
    carLoan: '',
    education: '',
    marriage: '',
    occupation: ''
  }
};

// ======================================
// Page Navigation
// ======================================
function navigateTo(pageId) {
  const currentPageEl = document.getElementById(state.currentPage);
  const nextPageEl = document.getElementById(pageId);

  if (!currentPageEl || !nextPageEl || state.currentPage === pageId) return;

  // Hide current page
  currentPageEl.classList.remove('active');

  // Show next page
  nextPageEl.classList.add('active');
  nextPageEl.scrollTop = 0;
  window.scrollTo(0, 0);

  state.currentPage = pageId;

  // Trigger page-specific logic
  if (pageId === 'page3') {
    startProcessingAnimation();
  }
  if (pageId === 'page4') {
    populateResultPage();
  }
}

// ======================================
// Init from URL parameter
// ======================================
function initFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  if (pageParam && document.getElementById(pageParam)) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    // Show specified page
    document.getElementById(pageParam).classList.add('active');
    state.currentPage = pageParam;
  }
}

// Make navigateTo globally accessible (used in onclick handlers)
window.navigateTo = navigateTo;

// ======================================
// Toast Notification
// ======================================
function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'toast-overlay';
  overlay.innerHTML = `<div class="toast-content">${message}</div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, duration);
}

// ======================================
// Page 1: Registration Logic
// ======================================
function initPage1() {
  const btnRegister1 = document.getElementById('btnRegister1');
  const btnRegister2 = document.getElementById('btnRegister2');
  const phoneInput = document.getElementById('phoneInput');
  const agreeCheck = document.getElementById('agreeCheck');

  function handleRegister() {
    const phone = phoneInput.value.trim();

    if (!phone) {
      showToast('请输入手机号');
      return;
    }

    if (!/^1\d{10}$/.test(phone)) {
      showToast('请输入正确的手机号');
      return;
    }

    if (!agreeCheck.checked) {
      showToast('请阅读并勾选同意用户协议与隐私政策');
      return;
    }

    state.formData.phone = phone;
    navigateTo('page2');
  }

  if (btnRegister1) btnRegister1.addEventListener('click', handleRegister);
  if (btnRegister2) btnRegister2.addEventListener('click', handleRegister);
}

// ======================================
// Page 2: Form Logic (Simplified fields)
// ======================================
function initPage2() {
  // Try to get city information dynamically
  tryGetCityInfo();

  // Option button selection (handles both single & multi-select groups)
  document.querySelectorAll('.option-group').forEach(group => {
    group.addEventListener('click', (e) => {
      // Debug logging
      console.log('Click detected on group:', group.dataset.field);
      
      const btn = e.target.closest('.option-btn');
      if (!btn) {
        console.log('No button found');
        return;
      }
      
      console.log('Button clicked:', btn.dataset.value);

      const field = group.dataset.field;
      if (!field || !state.formData.hasOwnProperty(field)) {
        console.log('Invalid field:', field);
        return;
      }

      const isMulti = group.classList.contains('multiple-select');

      if (isMulti) {
        // Toggle selected state
        btn.classList.toggle('active');
        
        // Collect all selected button values in this group
        const selectedValues = [];
        group.querySelectorAll('.option-btn.active').forEach(b => {
          selectedValues.push(b.dataset.value);
        });
        
        state.formData[field] = selectedValues;
        console.log('Multi-select updated:', field, selectedValues);
      } else {
        // Deselect siblings
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        // Select clicked
        btn.classList.add('active');
        
        state.formData[field] = btn.dataset.value;
        console.log('Single-select updated:', field, btn.dataset.value);
      }
    });
  });

  // Form submit validation
  const btnSubmit = document.getElementById('btnSubmitForm');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      const name = document.getElementById('realName').value.trim();
      const age = document.getElementById('realAge')?.value.trim();

      if (!name) {
        showToast('请输入真实姓名');
        return;
      }

      if (!age || age < 22 || age > 55) {
        showToast('请输入22-55之间的年龄');
        return;
      }

      state.formData.name = name;
      state.formData.age = age;

      // Validate option groups
      const optionFields = [
        { key: 'gender', name: '您的性别' },
        { key: 'expectedAmount', name: '您的期望金额' },
        { key: 'loanPeriod', name: '您的借款期限' },
        { key: 'zhima', name: '您的芝麻分' },
        { key: 'assets', name: '您的资产', isArray: true }
      ];

      for (const field of optionFields) {
        const val = state.formData[field.key];
        if (field.isArray) {
          if (!val || val.length === 0) {
            showToast(`请选择${field.name}`);
            return;
          }
        } else {
          if (!val) {
            showToast(`请选择${field.name}`);
            return;
          }
        }
      }

      navigateTo('page3');
    });
  }
}

// ======================================
// Dynamic City Detection
// ======================================
function tryGetCityInfo() {
  // Try to get city from geolocation API or IP-based service
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - got location, but we need reverse geocoding
        // For simplicity, we'll use a free IP-based API as fallback
        fetchCityByIP();
      },
      (error) => {
        // Error - user denied or unavailable, try IP-based
        console.log('Geolocation error:', error.message);
        fetchCityByIP();
      },
      { timeout: 5000 }
    );
  } else {
    // Geolocation not supported, try IP-based
    fetchCityByIP();
  }
}

function fetchCityByIP() {
  // Using a free IP geolocation API
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      if (data.city && data.region) {
        // Successfully got city info, convert pinyin to Chinese
        const cityName = convertPinyinToChinese(data.city);
        const regionName = convertPinyinToChinese(data.region);
        
        const cityModule = document.querySelector('.city-module');
        const cityValue = document.querySelector('.city-value');
        if (cityModule && cityValue) {
          cityValue.textContent = `${regionName}市/${cityName}市`;
          cityModule.style.display = 'block';
        }
      } else {
        // Failed to get city, hide the module
        hideCityModule();
      }
    })
    .catch(error => {
      console.log('Failed to fetch city by IP:', error);
      hideCityModule();
    });
}

// Convert common pinyin city names to Chinese
function convertPinyinToChinese(pinyin) {
  const cityMap = {
    'shanghai': '上海',
    'beijing': '北京',
    'guangzhou': '广州',
    'shenzhen': '深圳',
    'hangzhou': '杭州',
    'nanjing': '南京',
    'chengdu': '成都',
    'wuhan': '武汉',
    'tianjin': '天津',
    'chongqing': '重庆',
    'xian': '西安',
    'suzhou': '苏州',
    'zhengzhou': '郑州',
    'changsha': '长沙',
    'qingdao': '青岛',
    'dalian': '大连',
    'ningbo': '宁波',
    'xiamen': '厦门',
    'jinan': '济南',
    'fuzhou': '福州',
    'harbin': '哈尔滨',
    'shenyang': '沈阳',
    'kunming': '昆明',
    'nanning': '南宁',
    'hefei': '合肥',
    'taiyuan': '太原',
    'nanchang': '南昌',
    'shijiazhuang': '石家庄',
    'wenzhou': '温州',
    'dongguan': '东莞',
    'foshan': '佛山'
  };
  
  const lowerPinyin = pinyin.toLowerCase().trim();
  return cityMap[lowerPinyin] || pinyin; // Return original if not in map
}

function hideCityModule() {
  const cityModule = document.querySelector('.city-module');
  if (cityModule) {
    cityModule.style.display = 'none';
  }
}

// ======================================
// Page 3: Processing Animation Steps
// ======================================
function startProcessingAnimation() {
  const check1 = document.getElementById('check1');
  const check2 = document.getElementById('check2');
  const check3 = document.getElementById('check3');

  if (!check1 || !check2 || !check3) return;

  // Reset checklist states to pending
  check1.classList.add('checklist-done');
  check2.classList.remove('checklist-done');
  check3.classList.remove('checklist-done');

  updateCheckIcon(check1, 'done');
  updateCheckIcon(check2, 'pending');
  updateCheckIcon(check3, 'pending');

  // Step 2: Checking identity (start loading after 0.6s, finish after 2.2s)
  setTimeout(() => {
    updateCheckIcon(check2, 'loading');
  }, 600);

  setTimeout(() => {
    check2.classList.add('checklist-done');
    updateCheckIcon(check2, 'done');
  }, 2200);

  // Step 3: Verifying additional info (start loading after 2.6s, finish after 4.2s)
  setTimeout(() => {
    updateCheckIcon(check3, 'loading');
  }, 2600);

  setTimeout(() => {
    check3.classList.add('checklist-done');
    updateCheckIcon(check3, 'done');
  }, 4200);

  // Navigate to page4 (Result page after 4.8s)
  setTimeout(() => {
    navigateTo('page4');
  }, 4800);
}

function updateCheckIcon(element, status) {
  const iconEl = element.querySelector('.checklist-icon');
  if (!iconEl) return;

  if (status === 'done') {
    iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#52C41A"/><path d="M6 10l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else if (status === 'loading') {
    iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="icon-spin"><circle cx="10" cy="10" r="8" fill="none" stroke="#F5523C" stroke-width="2" stroke-dasharray="30 20"/></svg>';
  } else {
    iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#ddd"/></svg>';
  }
}

// ======================================
// Page 4: Pre-approval Result
// ======================================
function populateResultPage() {
  const { phone } = state.formData;

  // Format phone display with privacy stars: e.g. 138 **** 1234
  const displayEl = document.getElementById('resultPhoneDisplay');
  if (displayEl && phone) {
    const formatted = phone.slice(0, 3) + ' **** ' + phone.slice(-4);
    displayEl.textContent = formatted;
  }
}

function initPage4() {
  const btnResult = document.getElementById('btnResult');
  const agreeCheck = document.getElementById('resultAgreeCheck');

  if (btnResult) {
    btnResult.addEventListener('click', () => {
      if (!agreeCheck || !agreeCheck.checked) {
        showToast('请仔细阅读并勾选同意个人信息共享授权协议');
        return;
      }
      navigateTo('page5');
    });
  }
}

// ======================================
// Page 5: Download App Logic
// ======================================
function initPage5() {
  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      showToast('正在跳转至放鑫钱包官方APP下载页面...');
    });
  }
}

// ======================================
// Bottom Bar Scroll Visibility
// ======================================
function initBottomBarScroll() {
  const bottomBar = document.querySelector('.bottom-bar');
  if (!bottomBar) return;

  const triggerHeight = window.innerHeight * 0.8;

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > triggerHeight) {
      bottomBar.classList.add('visible');
    } else {
      bottomBar.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ======================================
// Initialize App Modules
// ======================================
document.addEventListener('DOMContentLoaded', () => {
  initFromUrl();
  initPage1();
  initPage2();
  initPage4();
  initPage5();
  initBottomBarScroll();
});
