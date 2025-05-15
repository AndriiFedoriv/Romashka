window.addEventListener('load', function () {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

  if (isIOS && isSafari && !isInStandaloneMode) {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ffd700;
        color: #4a3b00;
        padding: 12px 16px;
        font-size: 14px;
        text-align: center;
        box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
        z-index: 9999;
      ">
        📲 Щоб зручно користуватись — <b>додайте сайт на головний екран</b>:<br>
        <span style="font-size:18px;">Натисніть <span style="font-size:1.2em;vertical-align:middle;">📤</span> → <b>Додати на головний екран</b></span>
        <span style="margin-left: 10px; cursor: pointer;" onclick="this.parentElement.remove()">❌</span>
      </div>
    `;
    document.body.appendChild(banner);
  }
});