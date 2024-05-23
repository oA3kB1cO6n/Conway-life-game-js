let birth = [3]
let star = [2, 3]
let typeCount = 2

const container = document.getElementById('container')
const [generationsCountShow, exportBtn, importInp, generationsInp, jumpBtn, ruleSpan, stateBtn, stateShow, gridSizeBtn, gridSizeShow, gapBtn, gapShow, clearBtn] = "generationsCountShow1export1import1generations1jump1rule1state1stateShow1gridSize1gridSizeShow1gap1gapShow".split(1).map(n => document.getElementById(n))
const wh = Math.min(window.innerWidth - 16, window.innerWidth - 16)
let size = 20
let count = void 0
let gridSideLen = void 0
let timerId = void 0
let generationsCount = 0
let maxGenerationsCount = 0
let generations = []
let generationsMap = {}
let fillState = -1
let style = null
let cells = []
let gap = 50

let bitLen = BigInt((typeCount).toString(2).length)

function toggle(e) {
  const cell = e.target
  if (cell.tagName !== 'CELL') return
  if (fillState === -1) {
    let state = +cell.dataset.life
    state++
    cell.dataset.life = state > typeCount - 1 ? 0 : state
  } else {
    cell.dataset.life = fillState
  }
}

function resetGrid(size) {
  gridSideLen = wh / size
  count = size**2
  document.body.style.setProperty('--grid-side-len', gridSideLen + 'px')
  container.innerHTML = ''
  for (let i = 0; i < count; i++) { 
    cell = document.createElement('cell')
    cell.dataset.life = '0'
    cells.push(cell)
    container.appendChild(cell)
  }
}

function resetStyle(typeCount) {
  style?.remove()
  style = document.createElement('style')
  unit = 1 / (typeCount - 1)
  for (let i = 1; i < typeCount; i++) {
    style.innerHTML += `cell[data-life='${i}'] {
  background-color: rgb(0, 0, 0, ${(typeCount - i) * unit});
}
`
  }
  document.head.appendChild(style)
}

function loop(id) {
  return id < 0 ? id + size :
    id > (count - 1) ? id - size: id
}

function prevCell(id) {
  let id_ = id - 1
  if (Math.floor(id_ / size) !== Math.floor(id / size)) id_ += size
  return loop(id_)
}

function nextCell(id) {
  let id_ = id + 1
  if (Math.floor(id_ / size) !== Math.floor(id / size)) id_ -= size
  return loop(id_)
}

function getRoundCellsCount(id) {
  let prevRow = id-size
  let nextRow = id+size
  prevRow += prevRow < 0 ? count : 0
  nextRow -= nextRow > (count - 1) ? count : 0
  return [
    cells[prevCell(prevRow)],
    cells[prevRow],
    cells[nextCell(prevRow)],
    cells[prevCell(id)],
    cells[nextCell(id)],
    cells[prevCell(nextRow)],
    cells[nextRow],
    cells[nextCell(nextRow)]
  ].filter((v) => v.dataset.life === '1').length
}

function getNextState(state, roundCellsCount) {
  if (state === 1) {
    if (star.includes(roundCellsCount)) {
      return 1
    } else {
      state++
      return state > typeCount - 1 ? 0 : state
    }
  } else if (state > 1) {
    state++
    return state > typeCount - 1 ? 0 : state
  } else if (birth.includes(roundCellsCount)) {
    return 1
  }
  return 0
}

function nextGeneration() {
  if (generations.length == 0) saveGeneration()
  generationsCount++
  updateCount()
  maxGenerationsCount = generationsCount
  updateCount()
  for (let i = 0; i < count; i++) {
    const cell = cells[i]
    const roundCellsCount = getRoundCellsCount(i)
    isStar = star.includes(roundCellsCount)
    isBirth = birth.includes(roundCellsCount)
    cell.dataset.lifeTemp = getNextState(+cell.dataset.life, roundCellsCount)
  }
  cells.forEach(v => v.dataset.life = v.dataset.lifeTemp)
  saveGeneration()
}

function saveGeneration() {
  let _t = 0n
  for (let i = 0; i < count; i++) {
    _t <<= bitLen
    _t += BigInt(cells[i].dataset.life)
  }
  generations.push(_t)
  generationsMap[generationsCount] = generations.length - 1
}

function toGeneration(generation) {
  for (let i = count - 1; i >= 0; i--) {
     cells[i].dataset.life = generation & (2n ** bitLen - 1n)
     generation >>= bitLen
  }
}

function prevGeneration() {
  generationsCount--
  generationsCount >= 0 ? toGeneration(generations[generationsMap[generationsCount]]) : generationsCount = 0
  updateCount()
}

function toggleDisable(dis, ...btns) {
  btns.forEach(btn => btn.disabled = dis ? '1' : '')
}

function reset() {
  cells.forEach(v => v.dataset.life = '0')
  toggleDisable(false, prev, next, start, jump)
  clearInterval(timerId)
  generationsCount = 0
  maxGenerationsCount = 0
  updateCount()
  generations = []
  generationsMap = {}
}

function parseRule(rule) {
  BSC = rule.split('/')
  const obj = {}
  BSC.forEach((v) => {
    switch (v[0]) {
      case 'B':
        obj.birth = v.substring(1).split('').map((v2) => parseInt(v2, 10))
      case 'S':
        obj.star = v.substring(1).split('').map((v2) => parseInt(v2, 10))
      case 'C':
        obj.typeCount = +v.substring(1)
    }
  })
  return obj
}

function resetRule(rule) {
  obj = parseRule(rule)
  birth = obj.birth
  star = obj.star
  typeCount = obj.typeCount
  updateRule()
}

function setRule() {
  const ruleReg = /B\d+\/S\d+\/C\d+/
  const rule = prompt('输入规则（格式（正则）：B\\d+/S\\d+/C\\d+）\n默认B3/S23/C2')
  if (rule === null) return
  if (!ruleReg.test(rule)) {alert('非法规则'); return}
  if (confirm('警告：这将会重置网格，是否设置规则？')) {
    reset()
    resetRule(rule)
    bitLen = BigInt((typeCount - 1).toString(2).length)
    resetStyle(typeCount)
  }
}

function updateRule() {
  ruleSpan.textContent = `当前规则：B${birth.join('')}/S${star.join('')}/C${typeCount}`
}

function updateFillState() {
  stateShow.textContent = '当前填充状态：' + (fillState === -1 ? '无(切换模式)' : fillState)
}

function updateGridSize() {
  gridSizeShow.textContent = '当前网格大小：' + size
}

function updateGap() {
  gapShow.textContent = '当前最小迭代间隔：' + gap + 'ms'
}

function updateCount() {
  if (generationsCount > maxGenerationsCount) maxGenerationsCount = generationsCount
  generationsCountShow.innerHTML = `当前代：${generationsCount}/${maxGenerationsCount}`
  generationsInp.max = maxGenerationsCount
  generationsInp.value = generationsCount
}

exportBtn.onclick = () => {
  const blob = new Blob([`B${birth.join('')}/S${star.join('')}/C${typeCount};${size};${generations[generationsMap[generationsCount]].toString(16)}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = prompt('请输入文件名（无后缀名）（点击取消则使用默认名字）')
  a.href = url;
  a.download = fileName === null ? "data.txt" : fileName + '.txt';
  a.click();
}

importInp.onchange = event => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    let reader = new FileReader()

    reader.onload = () => {
      try {
        if (confirm('警告：这将会重置网格，是否导入？')) {
          let text = reader.result.split(';')
          alert(`规则：${text[0]} 网格大小：${text[1]}`)
          resetRule(text[0])
          bitLen = BigInt((typeCount - 1).toString(2).length)
          size = +text[1]
          gridSideLen = wh / size
          count = size ** 2
          cells = []
          resetGrid(size)
          resetStyle(typeCount)
          reset()
          updateGridSize()
          toGeneration(BigInt(`0x${text[2]}`))
          event.target.value = ''
        }
      } catch {
        alert('选择的文件可能无效')
        return
      }
    }

    reader.readAsText(selectedFile)
  }
}

generationsInp.oninput = (e) => {
  generationsCount = e.target.value
  toGeneration(generations[generationsMap[generationsCount]])
  updateCount()
}

jumpBtn.onclick = () => {
  _generationsCount = prompt('输入要跳转的代的编号')
  if (_generationsCount === null) return
  if (isNaN(_generationsCount) || _generationsCount === '') {alert('代的编号必须是数字'); return}
  if (_generationsCount < 0 || _generationsCount > maxGenerationsCount) {alert('指定的代不存在'); return}
  generationsCount = _generationsCount
  toGeneration(generations[generationsMap[generationsCount]])
  updateCount()
}

stateBtn.onclick = () => {
  const sta = prompt('点击细胞时后胞变成的状态\n输入状态（留空则使用切换模式，0为擦除模式）')
  if (sta === null) return
  if (sta === '') {
    fillState = -1
  } else {
    if (isNaN(sta)) {alert('填充状态必须为数字'); return}
    if (+sta > typeCount - 1) {alert('填充状态不能超过C规则的值减一'); return}
    if (+sta < 0) {alert('填充状态不能小于0'); return}
    fillState = Math.floor(+sta)
  }
  updateFillState()
}

gridSizeBtn.onclick = () => {
  const sz = prompt('输入网格大小')
  if (sz === null) return
  if (isNaN(sz)) {alert('网格大小必须为数字'); return}
  if (+sz <= 0) {alert('网格大小必须大于0'); return}
  if (+sz > 100) {alert('网格大小不能超过100'); return}
  if (confirm('警告：这将会重置网格，是否重设网格大小？')) {
    size = +sz
    gridSideLen = wh / size
    count = size ** 2
    cells = []
    resetGrid(sz)
    updateGridSize()
    reset()
  }
}

gapBtn.onclick = () => {
  let gp = prompt('输入迭代间隔(ms)')
  if (isNaN(gp)) {alert('迭代间隔必须为数字'); return}
  if (+gp < 3) {alert('迭代间隔不能小于3ms'); return}
  if (+gp > 5000) {alert('迭代间隔不能超过5000ms'); return}
  gap = gp
  updateGap()
}

container.onclick = toggle
resetGrid(size)
resetStyle(typeCount)
updateRule()
updateFillState()
updateGridSize()
updateGap()