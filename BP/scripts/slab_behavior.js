import { system } from "@minecraft/server";

const slabBlockComponent = {
	// FOR REGULAR MERGING
	beforeOnPlayerPlace(placeEvent) {
		const { block, player, face } = placeEvent;
		const item = player
			.getComponent("minecraft:inventory")
			.container.getItem(player.selectedSlotIndex);
		let adjacentBlock;
		switch (face) {
			case "Up": {
				placeEvent.cancel = true;
				adjacentBlock = block.below(1);
				if (
					adjacentBlock.typeId === item.typeId &&
					face === "Down" &&
					adjacentBlock.permutation?.getState("kado:double")
				) {
					console.warn(
						`Slab Type: ${block.permutation?.getState(
							"minecraft:vertical_half"
						)}\nFace: DOWN\nBlock: ${adjacentBlock}`
					);
				}
				break;
			}
			case "Down": {
				adjacentBlock = block.above(1);
				placeEvent.cancel = true;
				if (
					adjacentBlock.typeId === item.typeId &&
					face === "Up" &&
					adjacentBlock.permutation?.getState("kado:double")
				) {
					console.warn(
						`Slab Type: ${block.permutation?.getState(
							"minecraft:vertical_half"
						)}\nFace: UP\nBlock: ${adjacentBlock}`
					);
				}
				break;
			}
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
