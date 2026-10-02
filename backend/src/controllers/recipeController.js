import recipeService from "../services/recipeService";

const handleRead = async (req, res) => {
  try {
    let data = await recipeService.getAllRecipe(req.query);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "error from server",
      EC: -500,
      DT: null,
    });
  }
};

const handleCreate = async (req, res) => {};

const handleUpdate = async (req, res) => {};

const handleDelete = async (req, res) => {};

module.exports = {
  handleRead,
  handleCreate,
  handleUpdate,
  handleDelete,
};
