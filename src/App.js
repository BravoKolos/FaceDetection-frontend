import './App.css';
import React, { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import FunBackground from './components/FunBackground';


const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''

  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  }
  

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    };
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    const PAT = 'e4d0e9d084eb4c539b6f52d30ab16229';
    const USER_ID = 'm0i2legcfk9e';
    const APP_ID = 'facereco';
    const MODEL_ID = 'face-detection';
    const IMAGE_URL = this.state.input;

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID,
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": IMAGE_URL,
            },
          },
        },
      ],
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
      },
      body: raw,
    };

    fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, requestOptions)
      .then(response => response.json())
      .then(result => {
        if(result) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log);
        }
        // Log the entire result to understand its structure
        console.log('API Result:', result);

        // Check if outputs and regions are defined
        if (result.outputs && result.outputs[0] && result.outputs[0].data && result.outputs[0].data.regions) {
          const regions = result.outputs[0].data.regions;
          const box = this.calculateFaceLocation(result);
          this.displayFaceBox(box);
        } else {
          console.log('No regions detected or invalid response structure');
        }
      })
      .catch(error => console.log('error', error));
  };

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    } else {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <FunBackground className="particles" />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>

        { this.state.route === 'home' 
          ? <div> 
            <Logo />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onSubmit={this.onSubmit} 
            />
            <Rank 
              name={this.state.user.name} 
              entries={this.state.user.entries}
            />
            <FaceRecognition 
              box={this.state.box} 
              imageUrl={this.state.imageUrl} 
            />
          </div>
          : (
            this.state.route === 'signin'
          
            ? <SignIn
              loadUser={this.loadUser} 
              onRouteChange={this.onRouteChange}
            />
            : <Register 
              loadUser={this.loadUser} 
              onRouteChange={this.onRouteChange}
            />
        )
  }
      </div>
    );
  }
}

export default App;
