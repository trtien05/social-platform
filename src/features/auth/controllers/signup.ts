import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { signupSchema } from '@auth/schemas/signup';
import { joinValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import { Helpers } from '@global/helpers/helpers';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';

export class SignUp {

  //kiểm tra xem request gửi lên có hợp lệ không
  @joinValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;
    const checkIUserExist = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIUserExist) {
      throw new BadRequestError('Invalid credentials');
    }
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      email,
      username,
      password,
      avatarColor
    });
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', authData });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, uId, email, username, password, avatarColor } = data;
    return {
      _id,
      uId,
      email: Helpers.lowerCase(email),
      username: Helpers.firstLetterUppercase(username),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
