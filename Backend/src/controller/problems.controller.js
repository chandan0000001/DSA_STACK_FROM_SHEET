import problemModel from '../models/problems.model.js'

export async function getProblemsList(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    
    const filter = {};

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' }; // case-insensitive
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty; // exact match: Easy / Medium / Hard
    }

    const [problems, totalProblems] = await Promise.all([
      problemModel
        .find(filter)          
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),

      problemModel.countDocuments(filter)  
    ]);

    return res.status(200).json({
      message: "Problems fetched successfully",
      problems,
      pagination: {
        page,
        limit,
        totalProblems,
        totalPages: Math.ceil(totalProblems / limit),
        hasMore: skip + problems.length < totalProblems
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching problems",
      error: error.message
    });
  }
}

export async function postProblems(req, res) {
  try {
    const { name, link, tags, difficulty } = req.body ?? {};

    if (!name || !link) {
      return res.status(400).json({
        message: "Name and link are required"
      });
    }

    
    const lastProblem = await problemModel
      .findOne()
      .sort({ order: -1 });

    const newOrder = lastProblem ? lastProblem.order + 1 : 1;

    
    const problem = await problemModel.create({
      name,
      link,
      tags,
      difficulty,
      order: newOrder
    });

    return res.status(201).json({
      message: "Problem created successfully",
      problem,
    });

  } catch (error) {
    console.error("POST ERROR:", error);

    return res.status(500).json({
      message: "Server error while creating problem",
      error: error.message,
    });
  }
}
