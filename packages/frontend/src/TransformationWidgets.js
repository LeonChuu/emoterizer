
import React from 'react'
import Card from 'react-bootstrap/Card'
const zoomImageDefaultZoom = 5
const rollImageDefaultSpeed = 10
const genkiImageDefaultSpeed = 5
const imageDefaultInterval = 0
const defaultWidth = 128
const speedImageDefaultDelay = 2

export class TransformationSelector extends React.Component {
  constructor () {
    super()
    this.state = {
      transformation: 'flip',
      text: {
        EN: {
          flip: 'Flip',
          grayscale: 'Grayscale',
          rotate: 'Spin',
          genki: 'Genki',
          spiral: 'Spiral',
          zoom: 'Zoom',
          roll: 'Roll',
          speed: 'Speed',
          pat: 'Headpat',
          shake: 'Shake'
        },
        BR: {
          flip: 'Virar',
          grayscale: 'Grayscale',
          rotate: 'Girar',
          genki: 'Genki',
          spiral: 'Espiral',
          zoom: 'Zoom',
          roll: 'Rolar',
          speed: 'Velocidade',
          pat: 'Afagão'
        }
      }
    }
  }

  handleRadioChange (transformation) {
    this.props.onRadioChange(transformation)
  }

  handleSelectorChange (transformation) {
    this.props.onSelectorChange(transformation)
  }

  render () {
    const text = this.state.text[this.props.language]
    return (
      <div id='selector'>
        <form>
          <select onChange={
            (event) => {
              this.setState({ transformation: event.target.value }, () => { this.handleSelectorChange(this.state.transformation) })
            }
          }
          >
            <option value='flip'> {text.flip} </option>
            <option value='grayscale'>{text.grayscale}</option>
            <option value='rotate'>{text.rotate}</option>
            <option value='spiral'>{text.spiral}</option>
            <option value='zoom'>{text.zoom}</option>
            <option value='genki'>{text.genki}</option>
            <option value='roll'>{text.roll}</option>
            <option value='shake'>{text.shake}</option>
            <option value='speed'>{text.speed}</option>
            <option value='pat'>{text.pat}</option>
          </select>
          <input type='button' onClick={() => this.handleRadioChange(this.state.transformation)} value='VAI' />
        </form>
      </div>
    )
  }
}

class ImageDisplay extends React.Component {
  constructor () {
    super()
    this.state = {
      text: {
        EN: {
          full: 'Full Size',
          standalone: 'Standalone emoji size',
          inline: 'Inlined emoji size'
        },
        BR: {
          full: 'Tamanho total',
          standalone: 'Tamanho de emoji sozinho',
          inline: 'Tamanho de emoji em linha'
        }
      }
    }
  }

  render () {
    const text = this.state.text[this.props.language]
    return (
      <Card>
        <div class='image-display row align-items-end'>
          <div class='col-4'>
            {text.full}
            <br />
            <img src={this.props.image} alt='full' />
          </div>
          <div class='col-4'>
            {text.standalone}
            <br />
            <img src={this.props.image} class='emoji-jumboable' alt='emoji' />
          </div>
          <div class='col-4'>
            {text.inline}
            <br />
            <img src={this.props.image} class='emoji' alt='inlined emoji' />
          </div>
        </div>
      </Card>
    )
  }
}

class RangeValueSelector extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleValueChange = this.handleValueChange.bind(this)
    let value

    // 0 is an useable number, so we need to treat it differently
    if (this.props.value === 0) {
      value = 0
    } else if (this.props.value === null || this.props.value === undefined) {
      value = 'no value'
    } else {
      value = this.props.value
    }

    this.state = {
      value: value,
      default: true
    }
  }

  handleValueChange (e) {
    this.setState({ value: e.target.value }, () => {
      this.props.onValueChange(e.target.value, this.props.parameter)
    })
  }

  componentDidUpdate (prevProps) {
    this.props.onValueChange(this.props.value, this.props.parameter)
    if (this.props.parameter !== prevProps.parameter) {
      this.setState({ value: this.props.value })
    }
  }

  render () {
    console.log(this.props)
    console.log(this.state)
    const min = this.props.min || 1
    const max = this.props.max || 100
    return (
      <div id='selector' class='col-4'>
        <p>{this.props.title}</p>
        <p>{this.state.value}</p>
        <input type='range' min={min} max={max} value={this.state.value} onChange={this.handleValueChange} />
      </div>
    )
  }
}

export class TransformationValueSliders extends React.Component {
  constructor () {
    super()
    this.state = {
      transformation: 'flip',
      text: {
        EN: {
          rotationSpeed: 'Speed',
          zoom: 'Zoom',
          speed: 'Speed',
          rotation: 'Rotation',
          interval: 'Interval',
          intensity: 'Intensity',
          squish: 'Squish'
        },
        BR: {
          rotationSpeed: 'Velocidade',
          zoom: 'Zoom',
          speed: 'Velocidade',
          rotation: 'Rotação',
          interval: 'Interval',
          intensity: 'Intensidade',
          squish: 'Elasticidade'
        }
      }
    }
  }

  render () {
    const text = this.state.text[this.props.language]
    let displayAndImage = null
    if (this.props.transformationType === 'spiral') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='zoom' value={zoomImageDefaultZoom} title={text.zoom} />
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='rotationspeed' value='2' title={text.speed} />
        </div>
      )
    } else if (this.props.transformationType === 'genki') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={-100} max={100} parameter='speed' value={genkiImageDefaultSpeed} title={text.speed} />
          <RangeValueSelector onValueChange={this.props.onValueChange} min={0} max={defaultWidth} parameter='interval' value={imageDefaultInterval} title={text.interval} />
        </div>
      )
    } else if (this.props.transformationType === 'roll') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='speed' value={rollImageDefaultSpeed} title={text.speed} />
          <RangeValueSelector onValueChange={this.props.onValueChange} min={-180} max={180} parameter='rotationspeed' value='2' title={text.rotation} />
          <RangeValueSelector onValueChange={this.props.onValueChange} min={0} max={defaultWidth} parameter='interval' value={imageDefaultInterval} title={text.interval} />
        </div>
      )
    } else if (this.props.transformationType === 'rotate') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={-100} max={100} parameter='rotationspeed' value='50' title={text.speed} />
        </div>
      )
    } else if (this.props.transformationType === 'pat') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={1} max={99} parameter='squish' value='10' title={text.squish} />
        </div>
      )
    } else if (this.props.transformationType === 'shake') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={1} max={100} parameter='intensity' value='50' title={text.intensity} />
        </div>
      )
    } else if (this.props.transformationType === 'speed') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={2} parameter='delay' value={speedImageDefaultDelay} title={text.speed} />
        </div>
      )
    } else if (this.props.transformationType === 'zoom') {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='zoom' value={zoomImageDefaultZoom} title={text.zoom} />
        </div>
      )
    } else {
      displayAndImage = (
        <div class='row'>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='rotationspeed' value='50' title={text.speed} />
        </div>
      )
    }
    return displayAndImage
  }
}
export class TransformationDisplay extends React.Component {
  constructor () {
    super()
    this.state = {
      text: {
        EN: {
          size: 'Size',
          frames: 'Number of frames'
        },
        BR: {
          size: 'Tamanho',
          frames: 'Quantidade de frames'
        }
      }
    }
  }

  render () {
    const text = this.state.text[this.props.language]
    const selector = (
      <div>

        <ImageDisplay image={this.props.image} language={this.props.language} />
        <Card>
          <row class='bold-stats-text'>
            <p> {text.size}: {(this.props.size / 1024).toFixed(3)} KB</p>
            <p> {text.frames}: {this.props.frameNumber}</p>
          </row>
        </Card>
      </div>
    )

    return (
      <div>
        {selector}
      </div>
    )
  }
}
