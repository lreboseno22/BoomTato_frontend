export default function LobbyPage(){
    return (
        <div className="lobby-page">
            <h1>Find a Game or Create one</h1>

            <div className="lobby-container">
                <div className="join-lobby-container">
                    <ul>
                        <li>games in waiting status here</li>
                    </ul>
                </div>  
                <h2>Create a game lobby</h2>
                <form className="create-game-form">
                    <input />
                    <input />
                    <button>Create</button>
                </form>
            </div>
            
           
        </div>
    )
}