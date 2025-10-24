import { system } from "@minecraft/server";

const slabBlockComponent = {
	// FOR REGULAR MERGING
	beforeOnPlayerPlace(placeEvent) {
		const { block, player, face } = placeEvent;
		if (face !== "Up" && face !== "Down") return;
		const item = player
			.getComponent("minecraft:inventory")
			.container.getItem(player.selectedSlotIndex);
		let adjacentBlock;
		let mergeInteraction;
		switch (face) {
			case "Up": {
				adjacentBlock = block.below(1);
				mergeInteraction =
					adjacentBlock.permutation?.getState(
						"minecraft:vertical_half"
					) === "top"
						? false
						: true;
				break;
			}
			case "Down": {
				adjacentBlock = block.above(1);
				mergeInteraction =
					adjacentBlock.permutation?.getState(
						"minecraft:vertical_half"
					) === "bottom"
						? false
						: true;
				break;
			}
		}
		if (
			adjacentBlock.typeId === item.typeId &&
			adjacentBlock.permutation?.getState("kado:double") === false &&
			mergeInteraction === true
		) {
			placeEvent.cancel = true;
			system.run(() =>
				player.playSound("use.stone", adjacentBlock.location)
			);
			system.run(() =>
				adjacentBlock.setPermutation(
					adjacentBlock.permutation.withState("kado:double", true)
				)
			);
		}
	},
};

const slabItemComponent = {
	// FOR INDIRECT MERGING
	onItemUseOn(useEvent) {
		const {
			block,
			dimension,
			blockFace,
			itemStack,
			faceLocation,
			source: player,
		} = useEvent;
		const item = player
			.getComponent("minecraft:inventory")
			.container.getItem(player.selectedSlotIndex);
		if (
			block.typeId !== item.typeId ||
			blockFace !== "Up" ||
			blockFace !== "Down"
		)
			return;
		let adjacentBlock;
		switch (face) {
			case "Up":
				adjacentBlock = block.below(1);
				break;
			case "Down":
				adjacentBlock = block.above(1);
				break;
		}
	},
};

system.beforeEvents.startup.subscribe(
	({ blockComponentRegistry, itemComponentRegistry }) => {
		blockComponentRegistry.registerCustomComponent(
			"kado:slab",
			slabBlockComponent
		);
		itemComponentRegistry.registerCustomComponent(
			"kado:slab",
			slabItemComponent
		);
	}
);
