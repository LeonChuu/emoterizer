import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './frontend/css/index.css'
// import reportWebVitals from './utils/reportWebVitals'
import Jimp from 'jimp'
import { Transformation } from './graphical/Transformation.js'
import { TransformationDisplay, TransformationSelector, TransformationValueSliders} from './frontend/TransformationWidgets.js'
import { defaultWidth, defaultHeight } from './utils/defaultsAndConstants'
import { HeadBar } from './frontend/Navbar.js'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
const defaultLanguage = 'EN'
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
      <div id='input' class='col-12'>
        <div class='d-flex justify-content-center col'>
          <Card body>
            <div class='row'>
              <div>
                <input type='file' id='input' onChange={this.handleChange} />
                <TransformationSelector
                  onRadioChange={this.props.onRadioChange}
                  onSelectorChange={this.props.onSelectorChange}
                  language={this.props.language}
                />
              </div>
              <img src={this.props.image} class='original-image' alt='' />
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <Card.Body>
              <TransformationValueSliders
                onValueChange={this.props.onValueChange}
                transformationType={this.props.transformationType}
                language={this.props.language}
              />
            </Card.Body>
          </Card>
        </div>
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
    this.handleLanguageChange = this.handleLanguageChange.bind(this)
    this.state = {
      originalImage: null,
      transformation: null,
      values: {},
      image: 'static/X.png',
      language: defaultLanguage,
      textTest: { EN: 'test', BR: 'teste' }
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

  async handleLanguageChange (language) {
    this.setState({ language: language })
  }

  render () {
    return (
      <Container>
        <HeadBar
          onLanguageChange={this.handleLanguageChange}
        />
        <div id='page'>
          <h1>{this.state.textTest[this.state.language]}</h1>
          <div class='d-flex justify-content-center'>
            <ImageInput
              onInputChange={this.handleInputChange}
              onRadioChange={this.handleRadioChange}
              onSelectorChange={this.handleSelectorChange}
              onValueChange={this.handleValueChange}
              transformationType={this.state.transformationType}
              image={this.state.originalImageURL}
              language={this.state.language}
            />
          </div>
          <TransformationDisplay
            image={this.state.image}
            transformationType={this.state.transformationType}
            frameNumber={this.state.frameNumber}
            size={this.state.size}
            language={this.state.language}
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
