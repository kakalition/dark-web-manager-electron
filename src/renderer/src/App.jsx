import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const ipcHandle = () => {
    window.api.git()
  }

  // return (
  //   <>
  //     <img alt="logo" className="logo" src={electronLogo} />
  //     <div className="creator">Powered by electron-vite</div>
  //     <div className="text">
  //       Build an Electron app with <span className="react">React</span>
  //     </div>
  //     <p className="tip">
  //       Please try pressing <code>F12</code> to open the devTool
  //     </p>
  //     <div className="actions">
  //       <div className="action">
  //         <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
  //           Documentation
  //         </a>
  //       </div>
  //       <div className="action">
  //         <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
  //           Send IPC
  //         </a>
  //       </div>
  //     </div>
  //     <Versions></Versions>
  //   </>
  // )

  return <div className="flex items-center justify-center">
    <h1>Test</h1>
  </div>
}

export default App
