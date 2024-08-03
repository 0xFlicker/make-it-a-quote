import { classRegistry } from "fabric";

import { EditableImage } from "./EditableImage";
import { PfpCircle } from "./PfpCircle";

classRegistry.setClass(EditableImage, EditableImage.type);
classRegistry.setClass(PfpCircle, PfpCircle.type);
