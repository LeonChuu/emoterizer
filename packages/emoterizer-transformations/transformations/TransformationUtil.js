
function mod (n, m) {
  return ((n % m) + m) % m
}

const helpText = {
  flip: 'Flips a image.\n Options:\n direction (horizontal|vertical|both) - direction in which the image will be flipped. \n ',
  genki: 'Applies a sliding effect to an image.\n Options:\n interval - empty space between frames in pixels.\n speed - sliding speed. ',
  pat: 'Headpats an image.\n Options:\n squish (0 to 100)\n offset (0 to 125)',
  roll: 'Applies a rolling effect.\n Options:\n rotationspeed\n speed\n',
  rotate: 'Applies a rotating effect.\n Options:\n rotationspeed\n',
  speed: 'Speeds up an gif.\n Options:\n delay ( 2 to 100) - delay between frames in centisecs.',
  spiral: 'Applies a spiral effect to an image.\n Options:\n rotationspeed\n zoom',
  zoom: 'Applies a zooming effect to an image.\n Options:\n zoom - zooming power/speed'

}

module.exports = { mod, helpText }
