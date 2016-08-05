# noughtsCrossesAPI

An interface to the SMF/Softwire noughts & crosses DB!

## Usage
* `GET (hostname)/game/(gameNumber)` => game data!
* `POST (hostname)/game/(gameNumber)/move`,
  ```javascript
  {
    player: (1 or 2),
    position: [x, y]
  }
  ```
