package io.lambdaworks.knowledgebot.api.auth

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directive1
import akka.http.scaladsl.server.Directives.{complete, optionalHeaderValueByName, provide}
import com.auth0.jwk.UrlJwkProvider
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm

import java.security.interfaces.RSAPublicKey
import scala.util.Try

class AuthService(domain: String, audience: String) {

  def validateJWT(token: String): Option[String] =
    Try {
      val jwt       = JWT.decode(token.substring(7))
      val provider  = new UrlJwkProvider(domain)
      val jwk       = provider.get(jwt.getKeyId)
      val algorithm = Algorithm.RSA256(jwk.getPublicKey.asInstanceOf[RSAPublicKey], null)
      algorithm.verify(jwt)
      if (jwt.getAudience.contains(audience))
        Some(jwt.getSubject)
      else
        None
    } getOrElse (None)

  def authenticated: Directive1[String] =
    optionalHeaderValueByName("Authorization").flatMap {
      case Some(token) =>
        val sub = validateJWT(token)
        sub match {
          case Some(id) => provide(id)
          case _        => complete(StatusCodes.Unauthorized)
        }
      case _ => complete(StatusCodes.Unauthorized)
    }

  def maybeAuthenticated: Directive1[Option[String]] =
    optionalHeaderValueByName("Authorization").flatMap {
      case Some(token) => provide(validateJWT(token))
      case _           => provide(None)
    }

}
