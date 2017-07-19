
const colorChars = '02468acegikmoqsuwyACEGIK';
const rotation = {
  top: 0,
  right: 1,
  bottom: 2,
  left: 3,
};

function generateMovesString(history) {
  return history
    .reverse()
    .map(record => {
      const color = (record.pair[0] - 1) + (record.pair[1] - 1) * 6;
      const position = record.move.col + rotation[record.move.rotation] * 6;
      return colorChars[color] + colorChars[position];
    })
    .join('');
}

export default function generateIPSSimulatorURL(history) {
  return 'http://ips.karou.jp/simu/ps.html?_' + generateMovesString(history);
}