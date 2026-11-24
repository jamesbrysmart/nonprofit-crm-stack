// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { buildDonationFormEmbedSnippet } from 'src/donation-forms/donation-form-embed-snippet';

const embedSnippet = (url: string) => {
  document.body.innerHTML = buildDonationFormEmbedSnippet(url);
  const script = document.body.querySelector('script')?.textContent ?? '';
  new Function(script)();

  return document.body.querySelector('iframe') as HTMLIFrameElement;
};

const postResize = (
  source: MessageEventSource | null,
  data: Record<string, unknown>,
) => {
  window.dispatchEvent(new MessageEvent('message', { data, source }));
};

describe('donation form embed snippet', () => {
  it('escapes the form URL and keeps a fixed fallback height', () => {
    const frame = embedSnippet('https://crm.example/s/form?publicId=a&b="c"');

    expect(frame.getAttribute('src')).toBe('https://crm.example/s/form?publicId=a&b="c"');
    expect(frame.style.height).toBe('880px');
  });

  it('resizes only the iframe that sent the message', () => {
    const frame = embedSnippet('https://crm.example/s/form?publicId=a');

    postResize(frame.contentWindow, {
      type: 'nonprofit-fundraising:donation-form-resize',
      height: 1234.2,
      scrollIntoView: false,
    });
    expect(frame.style.height).toBe('1235px');

    postResize(window, {
      type: 'nonprofit-fundraising:donation-form-resize',
      height: 300,
      scrollIntoView: false,
    });
    expect(frame.style.height).toBe('1235px');
  });

  it('ignores unrelated messages and clamps extreme heights', () => {
    const frame = embedSnippet('https://crm.example/s/form?publicId=a');

    postResize(frame.contentWindow, { type: 'other', height: 400 });
    expect(frame.style.height).toBe('880px');

    postResize(frame.contentWindow, {
      type: 'nonprofit-fundraising:donation-form-resize',
      height: 10,
      scrollIntoView: false,
    });
    expect(frame.style.height).toBe('200px');
  });

  it('scrolls the form into view when it asks and is off screen', () => {
    const frame = embedSnippet('https://crm.example/s/form?publicId=a');
    const scrollIntoView = vi.fn();
    frame.scrollIntoView = scrollIntoView;
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      top: -400,
    } as DOMRect);

    postResize(frame.contentWindow, {
      type: 'nonprofit-fundraising:donation-form-resize',
      height: 900,
      scrollIntoView: true,
    });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });

  it('returns nothing without a form URL', () => {
    expect(buildDonationFormEmbedSnippet('')).toBe('');
  });
});
