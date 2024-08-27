import { isGiftCardAvailable, getGiftCardOrderId } from "../../../../shared/helpers";
import { GiftCard, OrderTransaction } from "../../../../shared/types";
import { AppState } from "../app-state";
import { attachActivateInfoAction } from "./activate/activate-action";
import { attachClaimAction } from "./claim/claim-action";
import { attachRevealAction } from "./reveal/reveal-action";
import { getApiBaseUrl, getUserCountryCode } from "./helpers";
import { getGiftCardActivateInfoHtml } from "./activate/activate-html";
import { getGiftCardHtml } from "./gift-card";
import { getRedeemCodeHtml } from "./reveal/redeem-code-html";

export async function initClaimGiftCard(app: AppState) {
  const giftCardsSection = document.getElementById("gift-cards");
  if (!giftCardsSection) {
    console.error("Missing gift cards section #gift-cards");
    return;
  }
  giftCardsSection.innerHTML = "Loading...";

  const activateInfoSection = document.getElementById("activate-info");
  if (!activateInfoSection) {
    console.error("Missing gift cards activate info section #activate-info");
    return;
  }
  activateInfoSection.innerHTML = "";

  const country = await getUserCountryCode();
  if (!country) {
    giftCardsSection.innerHTML = `<p class="list-error">Failed to load suitable virtual cards for you. Refresh or try disabling adblocker.</p>`;
    return;
  }

  const retrieveOrderUrl = `${getApiBaseUrl()}/get-order?orderId=${getGiftCardOrderId(app.reward.beneficiary, app.reward.signature)}`;
  const listGiftCardsUrl = `${getApiBaseUrl()}/list-gift-cards?country=${country}`;

  const requestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  const [retrieveOrderResponse, retrieveGiftCardResponse] = await Promise.all([fetch(retrieveOrderUrl, requestInit), fetch(listGiftCardsUrl, requestInit)]);

  const giftCard = (await retrieveGiftCardResponse.json()) as GiftCard;

  if (retrieveOrderResponse.status == 200) {
    const { transaction, product } = (await retrieveOrderResponse.json()) as {
      transaction: OrderTransaction;
      product: GiftCard | null;
    };

    addPurchasedCardHtml(product, transaction, app, giftCardsSection, activateInfoSection);
  } else if (retrieveGiftCardResponse.status == 200) {
    const availableGiftCard = isGiftCardAvailable(giftCard, app.reward.amount) ? giftCard : null;

    addAvailableCardsHtml(availableGiftCard, app, giftCardsSection, activateInfoSection);
  } else if (retrieveGiftCardResponse.status == 404) {
    giftCardsSection.innerHTML = "<p class='list-error'>There are no Visa/Mastercard available to claim at the moment.</p>";
  } else {
    giftCardsSection.innerHTML = "<p class='list-error'>There was a problem in fetching gift cards. Try again later.</p>";
  }

  attachActivateInfoAction();
}

function addPurchasedCardHtml(
  giftCard: GiftCard | null,
  transaction: OrderTransaction,
  app: AppState,
  giftCardsSection: HTMLElement,
  activateInfoSection: HTMLElement
) {
  const htmlParts: string[] = [];
  htmlParts.push(`<h2 class="heading-gift-card">Your virtual visa/mastercard</h2>`);
  htmlParts.push(`<div class="gift-cards-wrapper">`);
  htmlParts.push(getRedeemCodeHtml(transaction));

  if (giftCard) {
    htmlParts.push(getGiftCardHtml(giftCard, app.reward.amount));
  }

  htmlParts.push(`</div>`);

  giftCardsSection.innerHTML = htmlParts.join("");

  if (giftCard) {
    const activateInfoHtmlParts: string[] = [];
    activateInfoHtmlParts.push(getGiftCardActivateInfoHtml(giftCard));
    activateInfoSection.innerHTML = activateInfoHtmlParts.join("");
  }

  attachRevealAction(transaction, app);
}

function addAvailableCardsHtml(giftCard: GiftCard | null, app: AppState, giftCardsSection: HTMLElement, activateInfoSection: HTMLElement) {
  const htmlParts: string[] = [];

  htmlParts.push(`<h2 class="heading-gift-card">Or mint a virtual visa/mastercard</h2>`);
  if (giftCard) {
    htmlParts.push(`<div class="gift-cards-wrapper">`);
    htmlParts.push(getGiftCardHtml(giftCard, app.reward.amount));
    htmlParts.push(`</div>`);

    giftCardsSection.innerHTML = htmlParts.join("");

    const activateInfoHtmlParts: string[] = [];
    activateInfoHtmlParts.push(getGiftCardActivateInfoHtml(giftCard));
    activateInfoSection.innerHTML = activateInfoHtmlParts.join("");

    attachClaimAction("mint-btn", giftCard, app);
  } else {
    htmlParts.push(`<p class="list-error">There are no Visa/Mastercard available to claim at the moment.</p>`);
    giftCardsSection.innerHTML = htmlParts.join("");
  }
}
