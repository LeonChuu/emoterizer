import React from 'react'
import ReactDOM from 'react-dom'
import './frontend/css/index.css'
import reportWebVitals from './utils/reportWebVitals'
import Jimp from 'jimp'
import { Transformation } from './graphical/Transformation.js'
import { TransformationDisplay } from './frontend/TransformationWidgets.js'
import { defaultWidth, defaultHeight } from './utils/defaultsAndConstants'
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
      values: {}
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
    let JimpImage
    try {
      JimpImage = await Jimp.read(URL.createObjectURL(image))
    } catch (e) {
      console.log(e)
      return
    }

    if (resizeFlag) {
      JimpImage.resize(defaultHeight, defaultWidth)
    }
    this.setState({ originalImage: JimpImage })
  }

  async handleRadioChange (transformationType) {
    console.log(this.state)
    this.transformation = new Transformation()
    this.setState({
      transformationType: transformationType,
      image: await Transformation.updateImage(this.state.originalImage, transformationType, this.state.values)
    })
  }

  async handleSelectorChange (transformationType) {
    // this.transformation = new Transformation(this.state.originalImage, 50)
    this.setState({ transformationType: transformationType })
  }

  render () {
    return (
      <div id='page'>
        <ImageInput onInputChange={this.handleInputChange} />
        <TransformationDisplay
          onRadioChange={this.handleRadioChange} image={this.state.image}
          onValueChange={this.handleValueChange} transformationType={this.state.transformationType}
          onSelectorChange={this.handleSelectorChange}
        />
      </div>
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
