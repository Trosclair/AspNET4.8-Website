using System.Web.Mvc;

namespace TailWindTest.Controllers
{
    public class GameController/*lmfao*/ : Controller
    {
        // GET: Game
        public ActionResult SelectedGames()
        {
            return View();
        }

        public ActionResult Tetris()
        {
            return View();
        }
    }
}