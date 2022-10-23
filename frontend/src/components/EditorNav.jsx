
const EditorNav = () => {
  
  const handleClick = () => {
    const element = document.getElementById('main');
    const aside = document.getElementById('aside');
    const openBtn = document.getElementById('openBtn');
    element.classList.add('mainWrap');
    aside.style.display = 'flex';
    openBtn.style.display = 'none';
  }

  return (
    <div className="nav">

      <div className="menu">
        <button onClick={handleClick} id="openBtn" className="openBtn"><i className="bi bi-list"></i></button>
        <div className="filename">Test.js</div>
        <button className="edit-name"><i className="bi bi-pencil"></i></button>
      </div>

      <div className="menu">
        <button className="save"><i className="bi bi-download"></i></button>
        <button className="run"><i className="bi bi-play"></i></button>
      </div>

    </div>
  )
}

export default EditorNav