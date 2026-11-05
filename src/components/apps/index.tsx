import type { ReactNode } from 'react'
import type { AppDef, AppId } from '../../types'
import About from './About'
import Blog from './Blog'
import Brain from './Brain'
import Cinema from './Cinema'
import Diary from './Diary'
import Explorer from './Explorer'
import Guestbook from './Guestbook'
import Links from './Links'
import MathDungeon from './Math'
import { Page, RecycleBin, SiteMap } from './Misc'
import Music from './Music'
import Secret from './Secret'

export function renderApp(def: AppDef, open: (id: AppId) => void): ReactNode {
  switch (def.id) {
    case 'about': return <About />
    case 'brain': return <Brain />
    case 'math': return <MathDungeon />
    case 'diary': return <Diary />
    case 'music': return <Music />
    case 'cinema': return <Cinema />
    case 'blog': return <Blog />
    case 'explorer': return <Explorer />
    case 'guestbook': return <Guestbook />
    case 'links': return <Links />
    case 'secret': return <Secret />
    case 'bin': return <RecycleBin />
    case 'sitemap': return <SiteMap open={open} />
    default: return <Page source={def.page ?? '*(empty page)*'} />
  }
}
