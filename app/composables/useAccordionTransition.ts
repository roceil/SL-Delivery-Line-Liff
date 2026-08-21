/**
 * 手風琴展開／收合的高度動畫。
 *
 * Tailwind 無法對 auto 高度做轉場，因此在 Transition 的 JS hook 中先量出
 * scrollHeight 再套用固定高度，動畫結束後還原，讓內容維持自適應高度。
 */
export function useAccordionTransition() {
  function onAccordionEnter(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = '0'
    htmlEl.style.overflow = 'hidden'
    void htmlEl.offsetHeight
    htmlEl.style.transition = 'height 0.3s ease-in-out'
    htmlEl.style.height = `${htmlEl.scrollHeight}px`
  }

  function onAccordionAfterEnter(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = ''
    htmlEl.style.overflow = ''
    htmlEl.style.transition = ''
  }

  function onAccordionLeave(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = `${htmlEl.scrollHeight}px`
    htmlEl.style.overflow = 'hidden'
    void htmlEl.offsetHeight
    htmlEl.style.transition = 'height 0.3s ease-in-out'
    htmlEl.style.height = '0'
  }

  function onAccordionAfterLeave(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = ''
    htmlEl.style.overflow = ''
    htmlEl.style.transition = ''
  }

  return {
    onAccordionEnter,
    onAccordionAfterEnter,
    onAccordionLeave,
    onAccordionAfterLeave,
  }
}
