import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './frontend/css/index.css'
import reportWebVitals from './utils/reportWebVitals'
import Jimp from 'jimp'
import { Transformation } from './graphical/Transformation.js'
import { TransformationDisplay } from './frontend/TransformationWidgets.js'
import { defaultWidth, defaultHeight } from './utils/defaultsAndConstants'

import Container from 'react-bootstrap/Container'
// TODO colocar outra classe pra fazer a transformacao antes e rerenderizr

class ImageInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    this.props.onInputChange(e.target.files[0])
  }

  render () {
    return (
      <div id='input'>
        <h1> Input File </h1>
        <input type='file' id='input' onChange={this.handleChange} />
      </div>
    )
  }
}

class Page extends React.Component {
  constructor (props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleSelectorChange = this.handleSelectorChange.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.state = {
      originalImage: null,
      transformation: null,
      values: {},
      image: 'static/X.png'
    }
  }

  async handleValueChange (value, parameter) {
    const parameterObj = {}
    parameterObj[parameter] = parseFloat(value)
    const values = Object.assign({}, this.state.values, parameterObj)
    this.setState({ values: values })
  }

  async handleInputChange (image, resize) {
    const resizeFlag = resize || true
    console.log(image)
    let jimpImage, imageURL
    try {
      imageURL = URL.createObjectURL(image)
      jimpImage = await Jimp.read(imageURL)
    } catch (e) {
      console.log(e)
      return
    }

    if (resizeFlag) {
      jimpImage.resize(defaultHeight, defaultWidth)
    }
    this.setState({ originalImage: jimpImage, originalImageURL: imageURL })
  }

  async handleRadioChange (transformationType) {
    console.log(this.state)
    let targetImage
    if (transformationType === 'speed') {
      targetImage = Buffer.from(await (await (await window.fetch(this.state.originalImageURL)).blob()).arrayBuffer())
    } else {
      targetImage = this.state.originalImage
    }
    this.setState({
      transformationType: transformationType,
      ...await Transformation.updateImage(targetImage, transformationType, this.state.values)
    })
  }

  async handleSelectorChange (transformationType) {
    this.setState({ transformationType: transformationType })
  }

  render () {
    return (
      <Container>
        <div id='page'>
          <ImageInput onInputChange={this.handleInputChange} />
          <TransformationDisplay
            onRadioChange={this.handleRadioChange} image={this.state.image}
            onValueChange={this.handleValueChange} transformationType={this.state.transformationType}
            onSelectorChange={this.handleSelectorChange} frameNumber={this.state.frameNumber}
            size={this.state.size}
          />
        </div>
      </Container>
    )
  }
}
// ========================================

ReactDOM.render(
  <Page />,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
