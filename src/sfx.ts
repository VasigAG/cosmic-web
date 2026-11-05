// Tiny WebAudio blips. Disabled by default; toggled from the top bar.
let enabled = false
let ctx: AudioContext | null = null

export const sfx = {
  get enabled() { return enabled },
  set(v: boolean) { enabled = v },
  beep(freq = 660, ms = 70, type: OscillatorType = 'square', vol = 0.03) {
    if (!enabled) return
    try {
      ctx ??= new AudioContext()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = type
      o.frequency.value = freq
      g.gain.value = vol
      o.connect(g).connect(ctx.destination)
      o.start()
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000)
      o.stop(ctx.currentTime + ms / 1000)
    } catch { /* audio unavailable */ }
  },
  open() { this.beep(520, 60); setTimeout(() => this.beep(780, 80), 60) },
  close() { this.beep(400, 80, 'triangle') },
  click() { this.beep(900, 30) },
}
