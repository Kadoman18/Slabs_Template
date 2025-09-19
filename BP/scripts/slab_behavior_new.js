/** @format */

import { system, world } from "@minecraft/server";

// Helper to safely modify blocks outside read-only mode
function safeSetBlock(callback) {
	system.run(callback);
}

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
	const { block, player, blockFace } = event;

	const equipment = player.getComponent("equippable");
	if (!equipment) return;

	const selectedItem = equipment.getEquipment("Mainhand");
	if (!selectedItem || !selectedItem.typeId.includes("kado")) return;

	let adjacentBlock;
	let mergeIndirect;
	let mergeInteraction;
	let furtherBlock;
	let furtherBlockPerms;
	if (
		block.typeId === selectedItem.typeId &&
		block.permutation.withState("kado:double", false) &&
		(blockFace === "Up" || blockFace === "Down")
	) {
		switch (block.permutation?.getState("minecraft:vertical_half")) {
			case "top":
				mergeInteraction = blockFace === "Down" ? true : false;
				// console.warn(`BLOCKFACE: ${blockFace}\nMERGE: ${mergeInteraction}`);
				break;
			case "bottom":
				mergeInteraction = blockFace === "Up" ? true : false;
				// console.warn(`BLOCKFACE: ${blockFace}\nMERGE: ${mergeInteraction}`);
				break;
			default:
				console.warn(`Brokennnnn`);
				return;
		}
	}
	switch (blockFace) {
		case "North":
			adjacentBlock = block.north(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		case "East":
			adjacentBlock = block.east(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		case "South":
			adjacentBlock = block.south(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		case "West":
			adjacentBlock = block.west(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		case "Up":
			adjacentBlock = block.above(1);
			furtherBlock = block.above(2);
			furtherBlockPerms = furtherBlock.permutation?.getAllStates();

			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeInteraction === true) {
				safeSetBlock(() => {
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
					if (furtherBlockPerms) {
						furtherBlock.setPermutation(
							furtherBlock.permutation.withState(furtherBlockPerms, true)
						);
					}
					player.playSound("use.stone");
				});
			} else if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		case "Down":
			adjacentBlock = block.below(1);
			furtherBlock = block.below(2);
			furtherBlockPerms = furtherBlock.permutation?.getAllStates();

			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeInteraction === true) {
				safeSetBlock(() => {
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
					if (furtherBlockPerms) {
						furtherBlock.setPermutation(
							furtherBlock.permutation.withState(furtherBlockPerms, true)
						);
					}
					player.playSound("use.stone");
				});
			} else if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
					player.playSound("use.stone");
				});
			}
			break;
		default:
			console.warn(`Brokennnnn`);
			return;
	}
});
