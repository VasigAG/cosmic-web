import { useContent } from '../../state/content'
import { MatrixRain } from '../Effects'

export default function Secret() {
  const { matrix } = useContent().content.theme
  return (
    <div className="relative h-full min-h-[300px] overflow-hidden bg-black">
      <MatrixRain className="absolute inset-0 h-full w-full opacity-70" color={matrix} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
        <div className="floaty text-6xl [animation:floaty_3s_ease-in-out_infinite,hue_8s_linear_infinite]">👽</div>
        <h2 className="mt-3 font-pixel text-sm text-[#7dff9b] drop-shadow-[0_0_6px_#7dff9b]">YOU FOUND IT</h2>
        <p className="mt-2 max-w-sm bg-black/70 p-2 font-term text-xl text-pink">
          Hello, curious one. Most people never type the right word.
          Here is a small truth: the best parts of the internet were always hidden behind someone's weird little hobby.
        </p>
        <p className="mt-2 bg-black/70 px-2 font-term text-lg text-butter">★ unlocked: +1 mystery ★</p>
      </div>
    </div>
  )
}
