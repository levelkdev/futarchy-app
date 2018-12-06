import Aragon, { providers } from '@aragon/client'

export default new Aragon(new providers.WindowMessage(window.parent))
