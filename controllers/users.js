const httpConstants = require("http2").constants;
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;
const jwt = require("jsonwebtoken");

const { JWT_SECRET = "secret" } = process.env;

const UserModel = require("../models/user");

const ForbiddenError = require("../errors/forbidden-error");
const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ConflictError = require("../errors/conflict-error");
const UnauthorizedError = require("../errors/unauthorized-error");

const getUsers = (req, res, next) =>
  UserModel.find()
    .then((users) => res.status(httpConstants.HTTP_STATUS_OK).send(users))
    .catch(next);

const getUser = (req, res, next) => {
  const { _id } = req.user;
  return UserModel.findOne({ _id })
    .then((user) => {
      if (!user) {
        return next(new ForbiddenError("Попытка удалить чужую карточку"));
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(user);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  return UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError("Пользователь по указанному _id не найден"),
        );
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Передан невалидный _id"));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(
      new BadRequestError(
        "Переданы некорректные данные при создании пользователя",
      ),
    );
  }

  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) =>
      UserModel.create({ name, about, avatar, email, password: hash }),
    )
    .then((user) => {
      const { _id, emailRes, nameRes, aboutRes, avatarRes } = user;
      return res
        .status(httpConstants.HTTP_STATUS_CREATED)
        .send({ _id, emailRes, nameRes, aboutRes, avatarRes });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(
          new ConflictError(
            "При регистрации указан email, который уже существует на сервере",
          ),
        );
      }
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при создании пользователя",
          ),
        );
      }
      return next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate(
    _id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError("Пользователь по указанному _id не найден"),
        );
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при обновлении профиля",
          ),
        );
      }
      return next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate(
    _id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError("Пользователь по указанному _id не найден"),
        );
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при обновлении аватара",
          ),
        );
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email и password не могут быть пустыми"));
  }

  UserModel.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError("Передан неверный логин или пароль"));
      }
      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          return next(
            new UnauthorizedError("Передан неверный логин или пароль"),
          );
        }
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        return res
          .status(httpConstants.HTTP_STATUS_OK)
          .cookie("jwt", token, { maxAge: 3600000, httpOnly: true })
          .send(user);
      });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getUser,
};
