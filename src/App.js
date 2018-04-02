import React, {Component} from 'react';
import './App.css';
import queryString from 'query-string';

const defaultStyle = {
    color: '#FFF'
};

class PLaylistCounter extends Component {
    render() {
        return (<div style={{
                ...defaultStyle,
                width: "40%",
                display: "inline-block"
            }}>
            <h2>{this.props.playlists.length} playlists</h2>
        </div>);
    }
}

class HoursCounter extends Component {
    render() {
        const allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
            return songs.concat(eachPlaylist.songs)
        }, []);
        const totalDuration = allSongs.reduce((sum, eachSong) => {
            return sum + eachSong.duration;
        }, 0);
        /*const totalDuration =*/
        return (<div style={{
                ...defaultStyle,
                width: "40%",
                display: "inline-block"
            }}>
            <h2>{Math.round(totalDuration/60)} hours</h2>
        </div>);
    }
}

class Filter extends Component {
    render() {
        return (<div style={defaultStyle}>
            <img/>
            <input type="text" onKeyUp={event => this.props.onInputChange(event.target.value)}/>
        </div>);
    }
}

class PLaylist extends Component {
    render() {
        const playlist = this.props.playlist;
        return (<div style={{
                ...defaultStyle,
                display: "inline-block",
                width: "25%"
            }}>
            <img src={playlist.imageUrl} style={{width: "60px"}}/>
            <h3>{playlist.name}</h3>
            <ul>
                {playlist.songs.map(song => <li>{song.name}</li>)}
            </ul>
        </div>);
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            serverData: {},
            filterString : ''
        }
    }

    componentDidMount() {
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        /* fetch user's name from spotify */
        if (!accessToken) {
            return;
        }
        fetch('https://api.spotify.com/v1/me', {
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then((res) => res.json())
        .then(data =>
            this.setState({
                user: {
                    name: data.display_name
                }
            })
        );
        /* fetch user's playlists from spotify */
        fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then((res) => res.json())
        .then(data =>
            this.setState({
                playlists: data.items.map(item => ({
                    name: item.name,
                    imageUrl: item.images[0].url,
                    songs: []
                }))
            })
        );
    }

    render() {
        let buttonStyle = {
            color: "green",
            fontSize: "50px",
            marginTop: "20px",
            padding: "20px"
        }
        let playlistToRender =
        this.state.user && this.state.playlists
            ? this.state.playlists.filter(playlist =>
                playlist.name.toLowerCase().includes(
                this.state.filterString.toLowerCase()))
            : []
        return (<div className="App">
            {this.state.user
            ? <div>
                <h1 style={buttonStyle}>
                    {this.state.user.name}'s Playlists
                </h1>
                <PLaylistCounter playlists={playlistToRender}/>
                <HoursCounter playlists={playlistToRender}/>
                <Filter onInputChange={text => this.setState({filterString: text})}/>
                {playlistToRender.map(playlist => <PLaylist playlist={playlist}/>)}
            </div>
            : <button onClick={() => window.location = 'http://localhost:8888/login'}
            style={buttonStyle}>Sign in with Spotify</button>
            }
        </div>);
    }
}

export default App;
