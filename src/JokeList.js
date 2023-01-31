import React, { Component } from 'react';
import Joke from './Joke';
import './JokeList.css';
import axios from 'axios';

let API_URL = "https://icanhazdadjoke.com/";

class JokeList extends Component {

    static defaultProps = {
        // number of new jokes to get on page load, and when clicking fetch joke button.
        numJokesToGet: 1
    };

    constructor(props) {
        super(props);
        this.state = {
            // initial value of state. 
            // parse JSON into an array from local storage, or set jokes to an empty array if local storage is empty. 
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),

            // for loading spinner.
            loading: false
        };
        // to prevent duplicate jokes.
        this.seenJokes = new Set(this.state.jokes.map(j => j.id)); // console.log(this.seenJokes);

        // bind handleClick function in constructor.
        this.handleClick = this.handleClick.bind(this);
    };

    // componentDidMount runs on page load. 
    // get numJokesToGet number of jokes on page load. 
    componentDidMount() {

        // if local storage is an empty array, then request API for new jokes. 
        if (this.state.jokes.length === 0) {
            this.getNewJokes()
        }
    }

    // this function requests API for new jokes. 
    async getNewJokes() {

        // set headers for API in config file. 
        const config = {
            headers: {
                Accept: "application/json"
            }
        };

        try {
            // load unique jokes
            let jokes = [];

            while (jokes.length < this.props.numJokesToGet) {

                // make API request to get a new joke.
                let res = await axios.get(API_URL, config);

                // check if joke is unique. 
                // NOTE: jokes.length is not going to grow until we push a new joke into it. 
                if (!this.seenJokes.has(res.data.id)) {

                    // push object (which consists of joke, votes, and id) into jokes array.
                    jokes.push({ joke: res.data.joke, votes: 0, id: res.data.id });
                }
            }

            // setState using jokes from API (add new jokes to current state of jokes), and update local storage. 
            this.setState(st => ({
                jokes: [...st.jokes, ...jokes],
                loading: false
            }),
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );

            // setState using jokes from API (to overwrite current state of jokes).
            // // this.setState({ jokes: jokes })

            // update local storage with jokes (not in callback).
            // // window.localStorage.setItem("jokes", JSON.stringify(jokes));

        } catch (err) {

            // alert user with error message info.  
            alert(err);

            // after seeing alert message, setState of loading to false. 
            this.setState({ loading: false });
        }
    }

    handleClick() {

        // upon clicking fetch jokes button, setState of loading to true, and run callback function to getNewJokes.
        this.setState({ loading: true }, this.getNewJokes);
    }

    // handle upvotes and downvotes.
    // add current votes info to local storage. 
    handleVote(id, delta) {

        // set state of jokes array by mapping over current jokes array, and updating number of votes.
        this.setState(st => ({
            jokes: st.jokes.map(j => (
                j.id === id ? { ...j, votes: j.votes + delta } : j
            ))
        }),
            // run callback function to persist jokes info in local storage, as a string. 
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }

    // render Joke component(s).
    renderJokes() {

        // sort jokes array from most votes to least votes. 
        let sortedJokes = this.state.jokes.sort((a, b) => (b.votes - a.votes));

        // render Joke component(s) by mapping over sortedJokes array.
        return (
            sortedJokes.map(j => {
                return (
                    <Joke
                        key={j.id}
                        id={j.id}
                        text={j.joke}
                        votes={j.votes}
                        upvote={() => this.handleVote(j.id, 1)}
                        downvote={() => this.handleVote(j.id, -1)}
                    />
                )
            })
        )
    }


    render() {

        // if loading is true (i.e. lag due to data being fetched from API), show loader with spinning icon.  
        if (this.state.loading) {
            return (
                <div className="JokeList-loader">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            )
        }

        // if loading is false, display JokeList component.  
        return (
            <div className="JokeList">

                <div className="JokeList-sidebar">
                    <div className="JokeList-title">
                        <h1><span className="cheesy">Cheezy</span><span className="jokes">Jokes</span></h1>
                    </div>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="" />
                    <button className="JokeList-button" onClick={this.handleClick}>Fetch Jokes</button>
                </div>

                <div className="JokeList-jokes">
                    {this.renderJokes()}
                </div>

            </div>
        )
    }
}

export default JokeList;