import { init as initNode } from "@airstack/node";
import { init as initFrame } from "@airstack/frames";
import { airstackApiKey } from "@/config";

initNode(airstackApiKey);
initFrame(airstackApiKey);
