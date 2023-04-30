import { getPoolPositions, getCurrentTick } from './uniswap/graphQueries';
import fs from 'fs';

async function main() {
    // const positions = await getPoolPositions('0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640');
    // // console.log(positions.length);
    // // fs.writeFileSync('positions.json', JSON.stringify(positions));
    // const filtered = positions.filter(pos => parseInt(pos.collectedFeesToken0) > 0 || parseInt(pos.collectedFeesToken1) > 0);
    // console.log(filtered.length);
    // fs.writeFileSync('filtered.json', JSON.stringify(filtered));

    await getWorkingPositions();
}

async function getWorkingPositions() {
    const tick = await getCurrentTick('0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640');
    console.log(tick);
    const positions = await getPoolPositions('0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640');
    console.log(positions.length);
    const tickInt = parseInt(tick);
    const filtered = positions
                    .filter(pos => parseInt(pos.tickLower.tickIdx) <= tickInt && parseInt(pos.tickUpper.tickIdx) >= tickInt)
                    .filter(pos => parseInt(pos.transaction.timestamp) > Date.now() / 1000 - 60 * 60 * 24 * 30);
    console.log(filtered.length);
    fs.writeFileSync('filtered.json', JSON.stringify(filtered));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
