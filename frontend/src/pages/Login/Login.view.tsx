import Brand from '@components/brand/brand';
import {
   Container,
   ErrorList,
   Field,
   FieldError,
   Form,
   Heading,
   Input,
   Label,
   SubmitButton,
   Subtitle,
   Title,
} from './login.styles';
import type { ILoginViewProps } from './Login.types';

const LoginView = ({ register, errors, submitErrors, isSubmitting, onSubmit }: ILoginViewProps) => {
   return (
      <Container data-testid="login">
         <Brand size="lg" />
         <Form noValidate onSubmit={onSubmit} data-testid="login-form">
            <Heading>
               <Title>Bem-vindo de volta</Title>
               <Subtitle>Entre para acompanhar suas campanhas de prospecção.</Subtitle>
            </Heading>

            <Field>
               <Label htmlFor="login-email">E-mail</Label>
               <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="voce@empresa.com.br"
                  data-testid="login-email"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
               />
               {errors.email && <FieldError data-testid="login-email-error">{errors.email.message}</FieldError>}
            </Field>

            <Field>
               <Label htmlFor="login-password">Senha</Label>
               <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  data-testid="login-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
               />
               {errors.password && (
                  <FieldError data-testid="login-password-error">{errors.password.message}</FieldError>
               )}
            </Field>

            {submitErrors.length > 0 && (
               <ErrorList role="alert" data-testid="login-submit-errors">
                  {submitErrors.map((message) => (
                     <li key={message}>{message}</li>
                  ))}
               </ErrorList>
            )}

            <SubmitButton type="submit" data-testid="login-submit" disabled={isSubmitting}>
               {isSubmitting ? 'Entrando...' : 'Entrar'}
            </SubmitButton>
         </Form>
      </Container>
   );
};

export default LoginView;
