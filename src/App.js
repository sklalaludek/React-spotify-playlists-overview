import React, {Component} from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string';

const defaultStyle = {
    color: "#FFF",
    fontFamily: "Roboto"
};

const counterStyle = {
    ...defaultStyle,
    gridColumn: "5/7",
    width: "40%",
    marginBottom: "20px",
    fontSize: "20px",
    lineHeight: "30px"
}

class PLaylistCounter extends Component {
    render() {
        return (<div style={counterStyle}>
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
        let totalDurationHours = Math.round(totalDuration/60)
        let isTooLow = totalDurationHours < 40;
        let hoursCounterStyle = {
            ...counterStyle,
            gridColumn: "8/10",
            color: isTooLow ? "red" : "white",
            fontWeight: isTooLow ? "bold" : "normal"
        }
        return (<div style={hoursCounterStyle}>
            <h2>{totalDurationHours} hours</h2>
        </div>);
    }
}

class Filter extends Component {
    render() {
        return (<div style={{
                ...defaultStyle,
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center"
            }}>
            <img/>
            <input type="text" onKeyUp={event => this.props.onInputChange(event.target.value)} style={{...defaultStyle, color: "black", fontSize: "20px", padding: "10px", marginBottom: "20px"}}/>
        </div>);
    }
}

class PLaylist extends Component {
    render() {
        const playlist = this.props.playlist;
        const playListCounterStyle = {
            ...defaultStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "20px",
            backgroundColor: this.props.index % 2
                ? "silver"
                : "gray"
        }
        return (<div style={playListCounterStyle}>
            <img src={playlist.imageUrl} style={{width: "80px"}}/>
            <h3>{playlist.name}</h3>
            <ul style={{marginTop: "10px", fontWeight: "bold"}}>
                {playlist.songs.map(song =>
                    <li style={{paddingTop: "2px"}}>{song.name}</li>)}
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
        /* fetch user's playlists and tracks from spotify */
        fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then((res) => res.json())
        .then(playlistData => {
            let playlists = playlistData.items;
            /*an array of response objects*/
            let trackDataPromises = playlists.map(playlist => {
                let responsePromise = fetch(playlist.tracks.href, {
                    headers: {'Authorization': 'Bearer ' + accessToken}
                });
                let trackDataPromise = responsePromise.then(res => res.json());
                return trackDataPromise;
            });
            /*an array of objects*/
            let allTracksDataPromises = Promise.all(trackDataPromises);
            let playlistsPromise = allTracksDataPromises.then(trackDatas => {
                trackDatas.forEach((trackData, i) => {
                    playlists[i].trackDatas = trackData.items
                    .map(item => item.track)
                    .map(trackData => ({
                        name: trackData.name,
                        duration: trackData.duration_ms / 1000
                    }))
                })
                return playlists;
            })
            return playlistsPromise;
        })
        .then(playlists => this.setState({
            playlists: playlists.map(item => ({
                name: item.name,
                imageUrl: item.images[0].url,
                songs: item.trackDatas.slice(0,3)
            }))
        }))
    }

    render() {
        const buttonStyle = {
            gridColumn: "1 / -1",
            color: "white",
            backgroundColor: "#1ed760",
            fontSize: "50px",
            marginTop: "30px",
            marginBottom: "0",
            padding: "18px 48px 16px",
            cursor: "pointer",
            minWidth: "160px",
            textTransform: "uppercase",
            whiteSpace: "normal",
            letterSpacing: "2px",
            display: "block",
            width: "100%",
            fontWeight: "700",
            lineHeight: "1",
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid transparent",
            borderRadius: "500px",
            borderWidth: "0"
        }
        const appStyle = {
            display: "grid",
            gridGap: "3px",
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "120px 80px 80px auto"
        }
        const playlistContainer = {
            display: "grid",
            gridGap: "5px",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr)",
            gridAutoRows: "75px"
        }
        let playlistToRender =
        this.state.user && this.state.playlists
            ? this.state.playlists.filter(playlist => {
                let matchesPlaylist = playlist.name.toLowerCase().includes(
                this.state.filterString.toLowerCase())
                let matchesSong = playlist.songs.find(song => song.name.toLowerCase().includes(this.state.filterString.toLowerCase()))
                return matchesPlaylist || matchesSong
            })
            : []
        return (<div className="App">
            {this.state.user
            ? <div style={appStyle}>
                <h1 style={{...defaultStyle,
                    fontSize: "60px",
                    marginTop: 0,
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "center"
                }}>
                    {this.state.user.name}'s Playlists
                </h1>
                <PLaylistCounter playlists={playlistToRender}/>
                <HoursCounter playlists={playlistToRender}/>
                <Filter onInputChange={text => this.setState({filterString: text})}/>
                <div style={{gridColumn: "1 / -1", display: "grid", gridGap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr", gridAutoRows: "300px"}}>
                {playlistToRender.map((playlist, i) => <PLaylist playlist={playlist} index={i}/>)}
                </div>
            </div>
            : <button onClick={() => {
                window.location = window.location.href.includes('localhost')
                    ? 'http://localhost:8888/login'
                    : 'https://test-playlist-backend.herokuapp.com/login'
            }}
            style={buttonStyle}>Sign in with Spotify</button>
            }
        </div>);
    }
}

export default App;
