/** @format */

import { system } from "@minecraft/server";

const slabBlockComponent = {
	beforeOnPlayerPlace(event) {
		const { block, player } = event;
		const head = player.getHeadLocation();
		const target = player.dimension.getBlockFromRay(
			{ ...head, y: head.y + 0.1 },
			player.getViewDirection()
		);

		const item = player
			.getComponent("minecraft:inventory")
			.container.getItem(player.selectedSlotIndex);
		let adjacentBlock;
		let mergeIndirect;
		let mergeInteraction;
		if (
			block.typeId === item.typeId &&
			block.permutation?.getState("kado:double") &&
			(face === "Up" || face === "Down")
		) {
			switch (block.permutation?.getState("minecraft:vertical_half")) {
				case "top":
					mergeInteraction = face === "Down" ? true : false;
					console.warn(
						`BLOCKFACE: ${face} ~~~ SLAB: ${block.permutation?.getState(
							"minecraft:vertical_half"
						)}\nMERGE: ${mergeInteraction}`
					);
					break;
				case "bottom":
					mergeInteraction = face === "Up" ? true : false;
					console.warn(
						`BLOCKFACE: ${face} ~~~ SLAB: ${block.permutation?.getState(
							"minecraft:vertical_half"
						)}\nMERGE: ${mergeInteraction}`
					);
					break;
				default:
					console.warn(`Brokennnnn UP DOWN SECTION`);
					return;
			}
		}
		switch (face) {
			case "North":
				adjacentBlock = block.north(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				console.warn(
					`BLOCKFACE: ${face}\nMERGE-INDIRECT: ${mergeInteraction} ~~~ Adjacent block: ${adjacentBlock.typeId}`
				);
				break;
			case "East":
				adjacentBlock = block.east(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				break;
			case "South":
				adjacentBlock = block.south(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				break;
			case "West":
				adjacentBlock = block.west(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				break;
			case "Up":
				adjacentBlock = block.above(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeInteraction === true) {
					event.cancel = true;
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				} else if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				break;
			case "Down":
				adjacentBlock = block.below(1);
				mergeIndirect = adjacentBlock.typeId === item.typeId ? true : false;
				if (mergeInteraction === true) {
					event.cancel = true;
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				} else if (mergeIndirect === true) {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				}
				break;
			default:
				console.warn(`Brokennnnn SWITCH SECTION\n
					BLOCKFACE: ${face} ~~~ SLAB: ${block.permutation?.getState(
					"minecraft:vertical_half"
				)}\nMERGE: ${mergeInteraction}`);
				return;
		}
	},
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent(
		"kado:slab",
		slabBlockComponent
	);
});
