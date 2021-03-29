
import React from 'react'
import Card from 'react-bootstrap/Card'
import { zoomImageDefaultZoom, rollImageDefaultSpeed, genkiImageDefaultSpeed, imageDefaultInterval, defaultWidth } from '../utils/defaultsAndConstants.js'
export class TransformationSelector extends React.Component {
  constructor () {
    super()
    this.state = { transformation: 'flipHorizontal' }
  }

  handleRadioChange (transformation) {
    this.props.onRadioChange(transformation)
  }

  handleSelectorChange (transformation) {
    this.props.onSelectorChange(transformation)
  }

  render () {
    return (
      <div id='selector'>
        <form>
          <select onChange={
            (event) => {
              this.setState({ transformation: event.target.value }, () => { this.handleSelectorChange(this.state.transformation) })
            }
          }
          >
            <option value='flipVertical'> Vertical </option>
            <option value='flipHorizontal'>Horizontal</option>
            <option value='grayscale'>Grayscale</option>
            <option value='rotate'>Rotate</option>
            <option value='spiral'>Spiral</option>
            <option value='zoom'>Zoom</option>
            <option value='genki'>Genki</option>
            <option value='roll'>Roll</option>
            <option value='speed'>Speed</option>
            <option value='spin'>Spin</option>
          </select>
          <input type='button' onClick={() => this.handleRadioChange(this.state.transformation)} value='VAI' />
        </form>
      </div>
    )
  }
}

class ImageDisplay extends React.Component {
  render () {
    return (
      <Card>
        <div class='image-display row align-items-end'>
          <div class='col-4'>
            Full Size
            <br />
            <img src={this.props.image} alt='full' />
          </div>
          <div class='col-4'>
            Standalone emoji size
            <br />
            <img src={this.props.image} class='emoji-jumboable' alt='emoji' />
          </div>
          <div class='col-4'>
            <span>Inlined emoji size</span>
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
    console.log('aaaaa')
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
      <div id='selector'>
        <p>{this.state.value}</p>
        <input type='range' min={min} max={max} value={this.state.value} onChange={this.handleValueChange} />
      </div>
    )
  }
}

export class TransformationDisplay extends React.Component {
  render () {
    const selector = (
      <div>
        <TransformationSelector
          onRadioChange={this.props.onRadioChange}
          onSelectorChange={this.props.onSelectorChange}
        />
        <ImageDisplay image={this.props.image} />
      </div>
    )
    let displayAndImage = null
    if (this.props.transformationType === 'spiral') {
      displayAndImage = (
        <div>
          <span> Zoom</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='zoom' value={zoomImageDefaultZoom} />
          <span> Rotation</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='rotationSpeed' value='2' />
        </div>
      )
    } else if (this.props.transformationType === 'genki') {
      displayAndImage = (
        <div>
          <span> Speed</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={-100} max={100} parameter='speed' value={genkiImageDefaultSpeed} />
          <span> Interval</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={0} max={defaultWidth} parameter='interval' value={imageDefaultInterval} />
        </div>
      )
    } else if (this.props.transformationType === 'roll') {
      displayAndImage = (
        <div>
          <span> Speed</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='speed' value={rollImageDefaultSpeed} />
          <span> Rotation</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='rotationSpeed' value='2' />
          <span> Interval</span>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={0} max={defaultWidth} parameter='interval' value={imageDefaultInterval} />
        </div>
      )
    } else if (this.props.transformationType === 'rotate') {
      displayAndImage = (
        <div>
          <RangeValueSelector onValueChange={this.props.onValueChange} min={-100} max={100} parameter='rotationSpeed' value='50' />
        </div>
      )
    } else if (this.props.transformationType === 'zoom') {
      displayAndImage = (
        <div>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='zoom' value={zoomImageDefaultZoom} />
        </div>
      )
    } else {
      displayAndImage = (
        <div>
          <RangeValueSelector onValueChange={this.props.onValueChange} parameter='rotationSpeed' value='50' />
        </div>
      )
    }
    return (
      <div>
        {selector}
        <Card>
          {displayAndImage}
        </Card>
      </div>
    )
  }
}
