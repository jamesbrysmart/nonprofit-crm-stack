import { DONATION_FORM_RESIZE_MESSAGE_TYPE } from 'src/donation-forms/embed-client/donation-form-client.types';

const EMBED_FRAME_ATTRIBUTE = 'data-nonprofit-fundraising-donation-form';

// Sizes each embedded form from its own resize messages. The form page runs in
// a sandbox with an opaque origin, so frames are matched on event.source. If a
// site strips the script, the iframe keeps its fixed fallback height.
const HOST_RESIZE_SCRIPT = `(function () {
  if (window.__nfDonationFormResize) return;
  window.__nfDonationFormResize = true;
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || data.type !== '${DONATION_FORM_RESIZE_MESSAGE_TYPE}' || typeof data.height !== 'number') return;
    var frames = document.querySelectorAll('iframe[${EMBED_FRAME_ATTRIBUTE}]');
    for (var i = 0; i < frames.length; i++) {
      var frame = frames[i];
      if (frame.contentWindow !== event.source) continue;
      frame.style.height = Math.max(200, Math.min(Math.ceil(data.height), 10000)) + 'px';
      if (data.scrollIntoView) {
        var top = frame.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight) frame.scrollIntoView({ block: 'start' });
      }
    }
  });
})();`;

export const buildDonationFormEmbedSnippet = (iframeUrl: string): string =>
  iframeUrl === ''
    ? ''
    : `<iframe src="${iframeUrl
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')}" title="Donation form" ${EMBED_FRAME_ATTRIBUTE} loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="payment *" style="width:100%;height:880px;border:0;background:transparent;"></iframe>
<script>
${HOST_RESIZE_SCRIPT}
</script>`;
